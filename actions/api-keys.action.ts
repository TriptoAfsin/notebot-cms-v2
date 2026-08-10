"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { mintApiKey } from "@/lib/api-key";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { requireUser, UNAUTHORIZED } from "@/lib/session";

export async function getApiKeysAction() {
  if (!(await requireUser())) return [];
  return db
    .select({
      id: apiKeys.id,
      label: apiKeys.label,
      prefix: apiKeys.prefix,
      createdBy: apiKeys.createdBy,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt));
}

/**
 * Mints a key and returns the plaintext ONCE.
 *
 * Only the hash is persisted, so this response is the only opportunity to copy it. The UI has to
 * make that clear — a key the user assumes they can look up later is a support ticket.
 */
export async function createApiKeyAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return UNAUTHORIZED;

  const parsed = z.object({ label: z.string().trim().min(1, "Label is required").max(100) })
    .safeParse({ label: formData.get("label") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors, success: undefined };

  const { key, keyHash, prefix } = mintApiKey();
  const [row] = await db
    .insert(apiKeys)
    .values({ label: parsed.data.label, keyHash, prefix, createdBy: user.email ?? user.id })
    .returning();

  await logAudit({
    action: "create",
    entityType: "api_key",
    entityId: row.id,
    entityLabel: parsed.data.label,
    // never the key or its hash — an audit row is not a place to leak a credential
    after: { label: parsed.data.label, prefix },
  });

  revalidatePath("/api-keys");
  return { success: true, key, prefix };
}

export async function revokeApiKeyAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;

  // revoke rather than delete, so an audit entry referencing this key still resolves
  const [row] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id))
    .returning();

  await logAudit({
    action: "update",
    entityType: "api_key",
    entityId: id,
    entityLabel: row?.label,
    before: { revokedAt: null },
    after: { revokedAt: row?.revokedAt?.toISOString() ?? null },
  });

  revalidatePath("/api-keys");
  return { success: true };
}

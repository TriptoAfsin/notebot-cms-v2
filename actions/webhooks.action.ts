"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { webhookDeliveries, webhooks } from "@/lib/db/schema";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { dispatchWebhooks, newWebhookSecret, WEBHOOK_EVENTS } from "@/lib/webhooks";

export async function getWebhooksAction() {
  if (!(await requireUser())) return [];
  return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
}

/** Most recent attempts across all endpoints — the answer to "did it actually fire?". */
export async function getDeliveriesAction(limit = 25) {
  if (!(await requireUser())) return [];
  return db
    .select({
      id: webhookDeliveries.id,
      webhookId: webhookDeliveries.webhookId,
      event: webhookDeliveries.event,
      responseStatus: webhookDeliveries.responseStatus,
      error: webhookDeliveries.error,
      attempts: webhookDeliveries.attempts,
      durationMs: webhookDeliveries.durationMs,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);
}

const schema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
  url: z.string().trim().url("Must be a valid URL").max(1000),
  // empty selection means every event
  events: z.array(z.enum(WEBHOOK_EVENTS)).default([]),
});

export async function createWebhookAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return UNAUTHORIZED;

  const parsed = schema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    events: formData.getAll("events"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors, success: undefined };

  const secret = newWebhookSecret();
  const [row] = await db
    .insert(webhooks)
    .values({ ...parsed.data, secret, createdBy: user.email ?? user.id })
    .returning();

  await logAudit({
    action: "create",
    entityType: "webhook",
    entityId: row.id,
    entityLabel: parsed.data.label,
    // the secret is deliberately not recorded
    after: { label: parsed.data.label, url: parsed.data.url, events: parsed.data.events },
  });

  revalidatePath("/webhooks");
  // shown once so it can be pasted into the receiver; it stays readable in the row afterwards
  return { success: true, secret };
}

export async function toggleWebhookAction(id: number, enabled: boolean) {
  if (!(await requireUser())) return UNAUTHORIZED;
  await db
    .update(webhooks)
    // re-enabling clears the auto-disable state, otherwise it would trip again immediately
    .set({
      enabled,
      updatedAt: new Date(),
      ...(enabled ? { consecutiveFailures: 0, disabledReason: null } : {}),
    })
    .where(eq(webhooks.id, id));
  revalidatePath("/webhooks");
  return { success: true };
}

export async function deleteWebhookAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const [row] = await db.delete(webhooks).where(eq(webhooks.id, id)).returning();
  await logAudit({
    action: "delete",
    entityType: "webhook",
    entityId: id,
    entityLabel: row?.label,
    before: { label: row?.label, url: row?.url },
  });
  revalidatePath("/webhooks");
  return { success: true };
}

/** Sends a real signed request so the receiver can be checked without waiting for a submission. */
export async function testWebhookAction(id: number) {
  if (!(await requireUser())) return UNAUTHORIZED;
  const [hook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
  if (!hook) return { error: "That webhook no longer exists", success: undefined };
  if (!hook.enabled) return { error: "Enable the webhook before testing it", success: undefined };

  // awaited here, unlike a real event — the point is to report the outcome
  await dispatchWebhooks("submission.created", {
    test: true,
    note: "Test delivery from the NoteBot CMS",
  });

  const [latest] = await db
    .select({ status: webhookDeliveries.responseStatus, error: webhookDeliveries.error })
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.webhookId, id))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(1);

  revalidatePath("/webhooks");
  const ok = (latest?.status ?? 0) >= 200 && (latest?.status ?? 0) < 300;
  return ok
    ? { success: true, status: latest?.status }
    : { error: latest?.error || `Endpoint returned ${latest?.status ?? "no response"}`, success: undefined };
}

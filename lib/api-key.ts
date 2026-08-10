import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";

/**
 * Minting and verifying ingest API keys.
 *
 * Only the hash is stored, so the plaintext exists exactly once — in the response to the person
 * who created it. Lookup is by hash, which means the comparison is an indexed equality on a
 * digest rather than a scan plus per-row compare.
 */

const PREFIX = "nbk_";

export function mintApiKey() {
  const secret = randomBytes(24).toString("base64url");
  const key = `${PREFIX}${secret}`;
  return { key, keyHash: hashKey(key), prefix: key.slice(0, 12) };
}

export function hashKey(key: string) {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

export type VerifiedKey = { id: number; label: string; scopes: string[] };

/**
 * Resolves a presented key, or null.
 *
 * Returns null for unknown *and* revoked keys without distinguishing them — a caller learning
 * that its key used to be valid is information it does not need.
 */
export async function verifyApiKey(presented: string | null | undefined): Promise<VerifiedKey | null> {
  if (!presented || !presented.startsWith(PREFIX)) return null;

  const hash = hashKey(presented);
  const [row] = await db
    .select({
      id: apiKeys.id, label: apiKeys.label, scopes: apiKeys.scopes,
      keyHash: apiKeys.keyHash, expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)));

  if (!row) return null;

  // expiry is enforced here, not by a scheduled job — a key must stop working at its deadline
  // even if nothing has swept the table
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return null;

  // The DB already matched on equality; this is belt-and-braces against a future change that
  // fetches candidates some other way.
  const a = Buffer.from(row.keyHash);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // fire-and-forget: a failed bookkeeping write must not reject a valid request
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id)).catch(() => {});

  return { id: row.id, label: row.label, scopes: row.scopes ?? [] };
}

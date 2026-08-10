import { pgTable, serial, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Machine credentials for the ingest API.
 *
 * The secret is stored as a SHA-256 hash, never in plaintext: the value is shown once at
 * creation and cannot be recovered. A leaked database therefore does not hand over working
 * keys.
 *
 * `prefix` is the first few characters of the key, kept in the clear so a key can be identified
 * in the UI and in logs without being usable — the same reason GitHub shows `ghp_abc…`.
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: serial("id").primaryKey(),
    /** what this key is for, e.g. "n8n ingest" */
    label: varchar("label", { length: 100 }).notNull(),
    /** SHA-256 of the full key */
    keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
    /** leading chars, for display only */
    prefix: varchar("prefix", { length: 12 }).notNull(),
    /** reserved for narrowing what a key may do; today every key implies ingest:write */
    scopes: jsonb("scopes").$type<string[]>().default(["ingest:write"]).notNull(),
    createdBy: varchar("created_by", { length: 255 }),
    lastUsedAt: timestamp("last_used_at"),
    /**
     * Null means it never expires. A key handed to an integration tends to outlive the
     * integration, so the default in the UI is a bounded lifetime and "never" is the deliberate
     * choice rather than the accidental one.
     */
    expiresAt: timestamp("expires_at"),
    /** revoking keeps the row so the audit trail still resolves the key that acted */
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("api_keys_hash_idx").on(t.keyHash)]
);

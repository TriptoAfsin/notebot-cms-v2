import { pgTable, serial, varchar, integer, timestamp, jsonb, boolean, index, text } from "drizzle-orm/pg-core";

/**
 * Outbound webhooks.
 *
 * The form already emails on a new submission and then forgets; anything else wanting to react —
 * a Telegram bot, n8n, a spreadsheet — had no way to hear about it. These give an external system
 * a signed push instead of making it poll.
 */
export const webhooks = pgTable(
  "webhooks",
  {
    id: serial("id").primaryKey(),
    label: varchar("label", { length: 100 }).notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    /** shared secret for the HMAC signature; the receiver uses it to prove the call is ours */
    secret: varchar("secret", { length: 128 }).notNull(),
    /** which events to deliver; empty means all */
    events: jsonb("events").$type<string[]>().default([]).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    /** set when deliveries keep failing, so one dead endpoint cannot slow every write forever */
    disabledReason: varchar("disabled_reason", { length: 300 }),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("webhooks_enabled_idx").on(t.enabled)]
);

/**
 * One row per attempt.
 *
 * Without this a webhook that silently 500s is indistinguishable from one that was never
 * configured — the single most common way this kind of feature wastes an afternoon.
 */
export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: serial("id").primaryKey(),
    webhookId: integer("webhook_id").notNull(),
    event: varchar("event", { length: 50 }).notNull(),
    /** null while in flight, then the HTTP status, or 0 for a transport-level failure */
    responseStatus: integer("response_status"),
    /** truncated: a receiver returning a whole HTML error page must not bloat this table */
    responseBody: text("response_body"),
    error: varchar("error", { length: 300 }),
    attempts: integer("attempts").notNull().default(1),
    durationMs: integer("duration_ms"),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("webhook_deliveries_hook_idx").on(t.webhookId, t.createdAt),
    index("webhook_deliveries_created_idx").on(t.createdAt),
  ]
);

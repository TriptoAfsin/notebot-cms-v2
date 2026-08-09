import { pgTable, serial, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Who changed what, and what it looked like before.
 *
 * Content writes were unauthenticated until lib/session.ts landed, so there was no actor to
 * record and no way to answer "who added this note and what did it replace". `before`/`after`
 * hold the whole row rather than a field list, because the interesting questions after the fact
 * are usually about a field nobody thought to track.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    // better-auth owns the "user" table and it is not in this schema, so the actor is stored
    // denormalised — the log has to survive the user being deleted
    actorId: varchar("actor_id", { length: 255 }),
    actorEmail: varchar("actor_email", { length: 255 }),
    action: varchar("action", { length: 20 }).notNull(), // create | update | delete
    entityType: varchar("entity_type", { length: 50 }).notNull(), // note | topic | subject | …
    entityId: integer("entity_id"),
    /** human-readable label so the log stays readable after the row is gone */
    entityLabel: varchar("entity_label", { length: 500 }),
    before: jsonb("before").$type<Record<string, unknown> | null>(),
    after: jsonb("after").$type<Record<string, unknown> | null>(),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_created_at_idx").on(t.createdAt),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_actor_idx").on(t.actorId),
  ]
);

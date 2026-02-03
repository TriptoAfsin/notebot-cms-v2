import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  createdBy: varchar("created_by", { length: 255 }),
  usedBy: varchar("used_by", { length: 255 }),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

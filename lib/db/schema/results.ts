import type { JsonObject } from "../json";
import { pgTable, serial, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  category: varchar("category", { length: 100 }),
  sortOrder: integer("sort_order").notNull().default(0),
  metadata: jsonb("metadata").$type<JsonObject>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

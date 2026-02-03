import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const noteSubmissions = pgTable("note_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  batch: varchar("batch", { length: 50 }).notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  subjectName: varchar("subject_name", { length: 255 }).notNull(),
  topicName: varchar("topic_name", { length: 255 }).notNull(),
  noteLink: varchar("note_link", { length: 1000 }).notNull(),
  contactInfo: varchar("contact_info", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

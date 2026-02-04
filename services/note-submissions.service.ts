import { db } from "@/lib/db";
import { noteSubmissions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAll(status?: string) {
  if (status && status !== "all") {
    return db
      .select()
      .from(noteSubmissions)
      .where(eq(noteSubmissions.status, status))
      .orderBy(desc(noteSubmissions.createdAt));
  }
  return db.select().from(noteSubmissions).orderBy(desc(noteSubmissions.createdAt));
}

export async function getById(id: number) {
  const [submission] = await db
    .select()
    .from(noteSubmissions)
    .where(eq(noteSubmissions.id, id));
  return submission || null;
}

export async function create(data: {
  name: string;
  batch: string;
  department: string;
  level: string;
  subjectName: string;
  topicName: string;
  noteLink: string;
  contactInfo: string;
}) {
  const [submission] = await db.insert(noteSubmissions).values(data).returning();
  return submission;
}

export async function getByContact(contactInfo: string) {
  return db
    .select()
    .from(noteSubmissions)
    .where(eq(noteSubmissions.contactInfo, contactInfo))
    .orderBy(desc(noteSubmissions.createdAt));
}

export async function review(
  id: number,
  data: { status: string; reviewedBy: string; reviewNote?: string }
) {
  const [submission] = await db
    .update(noteSubmissions)
    .set({
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: new Date(),
      reviewNote: data.reviewNote || null,
      updatedAt: new Date(),
    })
    .where(eq(noteSubmissions.id, id))
    .returning();
  return submission;
}

export async function deleteById(id: number) {
  await db.delete(noteSubmissions).where(eq(noteSubmissions.id, id));
}

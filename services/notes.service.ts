import { db } from "@/lib/db";
import { notes, topics } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getNotes(topicId?: number) {
  const query = db
    .select({
      id: notes.id,
      topicId: notes.topicId,
      title: notes.title,
      url: notes.url,
      sortOrder: notes.sortOrder,
      metadata: notes.metadata,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      topicName: topics.displayName,
    })
    .from(notes)
    .leftJoin(topics, eq(notes.topicId, topics.id))
    .orderBy(asc(notes.sortOrder));

  if (topicId) {
    return query.where(eq(notes.topicId, topicId));
  }
  return query;
}

export async function getNoteById(id: number) {
  const [note] = await db.select().from(notes).where(eq(notes.id, id));
  return note || null;
}

export async function createNote(data: {
  topicId: number;
  title: string;
  url: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [note] = await db.insert(notes).values(data).returning();
  return note;
}

export async function updateNote(
  id: number,
  data: Partial<{ topicId: number; title: string; url: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [note] = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();
  return note;
}

export async function deleteNote(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
}

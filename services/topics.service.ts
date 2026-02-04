import { db } from "@/lib/db";
import { topics, subjects } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getTopics(subjectId?: number) {
  const query = db
    .select({
      id: topics.id,
      subjectId: topics.subjectId,
      name: topics.name,
      displayName: topics.displayName,
      slug: topics.slug,
      sortOrder: topics.sortOrder,
      metadata: topics.metadata,
      createdAt: topics.createdAt,
      updatedAt: topics.updatedAt,
      subjectName: subjects.displayName,
    })
    .from(topics)
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
    .orderBy(asc(topics.sortOrder));

  if (subjectId) {
    return query.where(eq(topics.subjectId, subjectId));
  }
  return query;
}

export async function getTopicById(id: number) {
  const [topic] = await db.select().from(topics).where(eq(topics.id, id));
  return topic || null;
}

export async function createTopic(data: {
  subjectId: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [topic] = await db.insert(topics).values(data).returning();
  return topic;
}

export async function updateTopic(
  id: number,
  data: Partial<{ subjectId: number; name: string; displayName: string; slug: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [topic] = await db
    .update(topics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(topics.id, id))
    .returning();
  return topic;
}

export async function deleteTopic(id: number) {
  await db.delete(topics).where(eq(topics.id, id));
}

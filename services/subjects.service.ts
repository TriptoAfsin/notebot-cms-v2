import { db } from "@/lib/db";
import { subjects, levels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getSubjects(levelId?: number) {
  const query = db
    .select({
      id: subjects.id,
      levelId: subjects.levelId,
      name: subjects.name,
      displayName: subjects.displayName,
      slug: subjects.slug,
      sortOrder: subjects.sortOrder,
      metadata: subjects.metadata,
      createdAt: subjects.createdAt,
      updatedAt: subjects.updatedAt,
      levelName: levels.displayName,
    })
    .from(subjects)
    .leftJoin(levels, eq(subjects.levelId, levels.id))
    .orderBy(asc(subjects.sortOrder));

  if (levelId) {
    return query.where(eq(subjects.levelId, levelId));
  }
  return query;
}

export async function getSubjectById(id: number) {
  const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
  return subject || null;
}

export async function createSubject(data: {
  levelId: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [subject] = await db.insert(subjects).values(data).returning();
  return subject;
}

export async function updateSubject(
  id: number,
  data: Partial<{ levelId: number; name: string; displayName: string; slug: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [subject] = await db
    .update(subjects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subjects.id, id))
    .returning();
  return subject;
}

export async function deleteSubject(id: number) {
  await db.delete(subjects).where(eq(subjects.id, id));
}

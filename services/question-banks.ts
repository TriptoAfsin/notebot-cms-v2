import { db } from "@/lib/db";
import { questionBanks, levels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getQuestionBanks(levelId?: number) {
  const query = db
    .select({
      id: questionBanks.id,
      levelId: questionBanks.levelId,
      subjectSlug: questionBanks.subjectSlug,
      title: questionBanks.title,
      url: questionBanks.url,
      sortOrder: questionBanks.sortOrder,
      metadata: questionBanks.metadata,
      createdAt: questionBanks.createdAt,
      updatedAt: questionBanks.updatedAt,
      levelName: levels.displayName,
    })
    .from(questionBanks)
    .leftJoin(levels, eq(questionBanks.levelId, levels.id))
    .orderBy(asc(questionBanks.sortOrder));

  if (levelId) {
    return query.where(eq(questionBanks.levelId, levelId));
  }
  return query;
}

export async function getQuestionBankById(id: number) {
  const [qb] = await db.select().from(questionBanks).where(eq(questionBanks.id, id));
  return qb || null;
}

export async function createQuestionBank(data: {
  levelId: number;
  subjectSlug: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [qb] = await db.insert(questionBanks).values(data).returning();
  return qb;
}

export async function updateQuestionBank(
  id: number,
  data: Partial<{ levelId: number; subjectSlug: string; title: string; url: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [qb] = await db
    .update(questionBanks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(questionBanks.id, id))
    .returning();
  return qb;
}

export async function deleteQuestionBank(id: number) {
  await db.delete(questionBanks).where(eq(questionBanks.id, id));
}

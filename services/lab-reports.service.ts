import { db } from "@/lib/db";
import { labReports, levels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getLabReports(levelId?: number) {
  const query = db
    .select({
      id: labReports.id,
      levelId: labReports.levelId,
      subjectSlug: labReports.subjectSlug,
      topicName: labReports.topicName,
      title: labReports.title,
      url: labReports.url,
      sortOrder: labReports.sortOrder,
      metadata: labReports.metadata,
      createdAt: labReports.createdAt,
      updatedAt: labReports.updatedAt,
      levelName: levels.displayName,
    })
    .from(labReports)
    .leftJoin(levels, eq(labReports.levelId, levels.id))
    .orderBy(asc(labReports.sortOrder));

  if (levelId) {
    return query.where(eq(labReports.levelId, levelId));
  }
  return query;
}

export async function getLabReportById(id: number) {
  const [report] = await db.select().from(labReports).where(eq(labReports.id, id));
  return report || null;
}

export async function createLabReport(data: {
  levelId: number;
  subjectSlug: string;
  topicName: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [report] = await db.insert(labReports).values(data).returning();
  return report;
}

export async function updateLabReport(
  id: number,
  data: Partial<{
    levelId: number;
    subjectSlug: string;
    topicName: string;
    title: string;
    url: string;
    sortOrder: number;
    metadata: Record<string, unknown>;
  }>
) {
  const [report] = await db
    .update(labReports)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(labReports.id, id))
    .returning();
  return report;
}

export async function deleteLabReport(id: number) {
  await db.delete(labReports).where(eq(labReports.id, id));
}

import { db } from "@/lib/db";
import { syllabuses } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getSyllabuses(batch?: string) {
  const query = db
    .select()
    .from(syllabuses)
    // same ordering the bot uses: batch, then curriculum dept order, then entry order
    .orderBy(
      asc(syllabuses.batch),
      asc(syllabuses.departmentSort),
      asc(syllabuses.department),
      asc(syllabuses.sortOrder)
    );

  if (batch) {
    return query.where(eq(syllabuses.batch, batch));
  }
  return query;
}

export async function getSyllabusBatches() {
  const rows = await db
    .selectDistinct({ batch: syllabuses.batch })
    .from(syllabuses)
    .orderBy(asc(syllabuses.batch));
  return rows.map((r) => r.batch);
}

export async function getSyllabusById(id: number) {
  const [row] = await db.select().from(syllabuses).where(eq(syllabuses.id, id));
  return row || null;
}

/**
 * The department label and its curriculum position belong to the department, not to a single
 * entry — so when either is edited, apply it to every row of that batch+department. Otherwise
 * the bot's department list would depend on which row happened to be read first.
 */
export async function syncDepartment(
  batch: string,
  department: string,
  departmentName: string,
  departmentSort: number
) {
  await db
    .update(syllabuses)
    .set({ departmentName, departmentSort, updatedAt: new Date() })
    .where(and(eq(syllabuses.batch, batch), eq(syllabuses.department, department)));
}

export async function createSyllabus(data: {
  batch: string;
  department: string;
  departmentName: string;
  departmentSort: number;
  topic: string;
  url: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [row] = await db.insert(syllabuses).values(data).returning();
  await syncDepartment(data.batch, data.department, data.departmentName, data.departmentSort);
  return row;
}

export async function updateSyllabus(
  id: number,
  data: Partial<{
    batch: string;
    department: string;
    departmentName: string;
    departmentSort: number;
    topic: string;
    url: string;
    sortOrder: number;
    metadata: Record<string, unknown>;
  }>
) {
  const [row] = await db
    .update(syllabuses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(syllabuses.id, id))
    .returning();
  if (row && data.departmentName !== undefined && data.departmentSort !== undefined) {
    await syncDepartment(row.batch, row.department, data.departmentName, data.departmentSort);
  }
  return row;
}

export async function deleteSyllabus(id: number) {
  await db.delete(syllabuses).where(eq(syllabuses.id, id));
}

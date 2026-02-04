import { db } from "@/lib/db";
import { routines, levels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getRoutines() {
  return db
    .select({
      id: routines.id,
      levelId: routines.levelId,
      term: routines.term,
      department: routines.department,
      title: routines.title,
      url: routines.url,
      sortOrder: routines.sortOrder,
      metadata: routines.metadata,
      createdAt: routines.createdAt,
      updatedAt: routines.updatedAt,
      levelName: levels.displayName,
    })
    .from(routines)
    .leftJoin(levels, eq(routines.levelId, levels.id))
    .orderBy(asc(routines.sortOrder));
}

export async function getRoutineById(id: number) {
  const [routine] = await db.select().from(routines).where(eq(routines.id, id));
  return routine || null;
}

export async function createRoutine(data: {
  levelId: number;
  term?: string;
  department?: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [routine] = await db.insert(routines).values(data).returning();
  return routine;
}

export async function updateRoutine(
  id: number,
  data: Partial<{
    levelId: number;
    term: string;
    department: string;
    title: string;
    url: string;
    sortOrder: number;
    metadata: Record<string, unknown>;
  }>
) {
  const [routine] = await db
    .update(routines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(routines.id, id))
    .returning();
  return routine;
}

export async function deleteRoutine(id: number) {
  await db.delete(routines).where(eq(routines.id, id));
}

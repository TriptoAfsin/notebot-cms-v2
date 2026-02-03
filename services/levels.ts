import { db } from "@/lib/db";
import { levels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getLevels() {
  return db.select().from(levels).orderBy(asc(levels.sortOrder));
}

export async function getLevelById(id: number) {
  const [level] = await db.select().from(levels).where(eq(levels.id, id));
  return level || null;
}

export async function createLevel(data: {
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [level] = await db.insert(levels).values(data).returning();
  return level;
}

export async function updateLevel(
  id: number,
  data: Partial<{ name: string; displayName: string; slug: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [level] = await db
    .update(levels)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(levels.id, id))
    .returning();
  return level;
}

export async function deleteLevel(id: number) {
  await db.delete(levels).where(eq(levels.id, id));
}

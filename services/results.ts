import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getResults() {
  return db.select().from(results).orderBy(asc(results.sortOrder));
}

export async function getResultById(id: number) {
  const [result] = await db.select().from(results).where(eq(results.id, id));
  return result || null;
}

export async function createResult(data: {
  title: string;
  url: string;
  category?: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}) {
  const [result] = await db.insert(results).values(data).returning();
  return result;
}

export async function updateResult(
  id: number,
  data: Partial<{ title: string; url: string; category: string; sortOrder: number; metadata: Record<string, unknown> }>
) {
  const [result] = await db
    .update(results)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(results.id, id))
    .returning();
  return result;
}

export async function deleteResult(id: number) {
  await db.delete(results).where(eq(results.id, id));
}

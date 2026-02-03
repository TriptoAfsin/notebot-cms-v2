import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function getAll() {
  return db.select().from(invitations).orderBy(desc(invitations.createdAt));
}

export async function create(data: {
  email?: string;
  role: string;
  createdById: string;
  expiresAt?: Date;
}) {
  const token = crypto.randomUUID();
  const expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      email: data.email || null,
      role: data.role,
      createdBy: data.createdById,
      expiresAt,
    })
    .returning();

  return invitation;
}

export async function getByToken(token: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token));
  return invitation || null;
}

export async function markUsed(token: string, userId: string) {
  const [invitation] = await db
    .update(invitations)
    .set({ usedBy: userId, usedAt: new Date() })
    .where(eq(invitations.token, token))
    .returning();
  return invitation;
}

export async function deleteById(id: number) {
  await db.delete(invitations).where(eq(invitations.id, id));
}

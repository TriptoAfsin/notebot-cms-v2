"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";
import * as invitationService from "@/services/invitations";
import { sendInvitationEmail } from "@/lib/email";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
});

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function getInvitations() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  return { data: await invitationService.getAll() };
}

const createSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["admin", "user"]),
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
});

export async function createInvitation(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    expiresInDays: formData.get("expiresInDays"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const expiresAt = new Date(
    Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000
  );

  const invitation = await invitationService.create({
    email: parsed.data.email || undefined,
    role: parsed.data.role,
    createdById: session.user.id,
    expiresAt,
  });

  if (parsed.data.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${invitation.token}`;
    await sendInvitationEmail({
      to: parsed.data.email,
      inviteUrl,
      role: parsed.data.role,
    }).catch(() => {}); // don't fail if email fails
  }

  revalidatePath("/invitations");
  return { success: true, token: invitation.token };
}

export async function deleteInvitation(id: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await invitationService.deleteById(id);
  revalidatePath("/invitations");
  return { success: true };
}

export async function validateInvitation(token: string) {
  const invitation = await invitationService.getByToken(token);

  if (!invitation) {
    return { valid: false, error: "Invitation not found" };
  }
  if (invitation.usedBy) {
    return { valid: false, error: "Invitation has already been used" };
  }
  if (new Date() > invitation.expiresAt) {
    return { valid: false, error: "Invitation has expired" };
  }

  return {
    valid: true,
    email: invitation.email,
    role: invitation.role,
  };
}

const registerSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerWithInvitation(data: {
  token: string;
  name: string;
  email: string;
  password: string;
}) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const invitation = await invitationService.getByToken(parsed.data.token);
  if (!invitation) {
    return { success: false, error: "Invalid invitation" };
  }
  if (invitation.usedBy) {
    return { success: false, error: "Invitation already used" };
  }
  if (new Date() > invitation.expiresAt) {
    return { success: false, error: "Invitation expired" };
  }

  try {
    const hashedPassword = await hashPassword(parsed.data.password);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
      [userId, parsed.data.name, parsed.data.email, invitation.role]
    );

    await pool.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [accountId, userId, userId, "credential", hashedPassword]
    );

    await invitationService.markUsed(parsed.data.token, userId);

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to register";
    return { success: false, error: message };
  }
}

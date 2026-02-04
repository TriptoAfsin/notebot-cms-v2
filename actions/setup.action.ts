"use server";

import { z } from "zod";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
});

export async function checkSuperAdminExists() {
  const result = await pool.query(
    `SELECT id FROM "user" WHERE role = 'admin' LIMIT 1`
  );
  return { exists: result.rows.length > 0 };
}

const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createSuperAdmin(data: {
  name: string;
  email: string;
  password: string;
}) {
  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Re-check that no admin exists (prevent race conditions)
  const { exists } = await checkSuperAdminExists();
  if (exists) {
    return { success: false, error: "Super admin already exists" };
  }

  try {
    // Ensure role column exists
    await pool.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`
    );

    const hashedPassword = await hashPassword(parsed.data.password);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
      [userId, parsed.data.name, parsed.data.email, "admin"]
    );

    await pool.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [accountId, userId, userId, "credential", hashedPassword]
    );

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create super admin";
    return { success: false, error: message };
  }
}

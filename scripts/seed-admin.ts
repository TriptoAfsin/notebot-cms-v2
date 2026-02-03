/**
 * Seed super admin user for NoteBot CMS
 *
 * Usage: npx tsx scripts/seed-admin.ts
 */

import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

async function seedAdmin() {
  const connStr = process.env.DATABASE_PUBLIC_URL;
  if (!connStr) {
    console.error("DATABASE_PUBLIC_URL not set in .env.local");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: connStr });

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  console.log("Seeding admin user...");

  // Add role column if it doesn't exist
  await pool.query(`
    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
  `);
  console.log("  Ensured role column exists.");

  const hashedPassword = await hashPassword(password);

  // Check if user already exists
  const existing = await pool.query(
    'SELECT id FROM "user" WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id;
    await pool.query(
      'UPDATE "user" SET name = $1, role = $2 WHERE email = $3',
      [name, "admin", email]
    );
    await pool.query(
      'UPDATE "account" SET password = $1 WHERE "userId" = $2 AND "providerId" = $3',
      [hashedPassword, userId, "credential"]
    );
    console.log(`  Updated existing admin: ${email}`);
  } else {
    const userId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
      [userId, name, email, "admin"]
    );
    const accountId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [accountId, userId, userId, "credential", hashedPassword]
    );
    console.log(`  Created admin: ${email} (id=${userId})`);
  }

  await pool.end();
  console.log("Done!");
}

seedAdmin().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

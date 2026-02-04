import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
});

export async function getAll() {
  const result = await pool.query(
    `SELECT id, name, email, role, "createdAt" FROM "user" ORDER BY "createdAt" DESC`
  );
  return result.rows;
}

export async function getById(id: string) {
  const result = await pool.query(
    `SELECT id, name, email, role, "createdAt" FROM "user" WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string) {
  await pool.query(`DELETE FROM "account" WHERE "userId" = $1`, [id]);
  await pool.query(`DELETE FROM "user" WHERE id = $1`, [id]);
}

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

/**
 * Read-only access to the `analytics` schema.
 *
 * That schema shares this database but is owned by the separate analytics API, not by Drizzle —
 * there is no migration here that creates it, and nothing in the CMS writes to it. Treating it as
 * read-only is deliberate: the CMS has no way to know what the analytics service expects, and a
 * write from here would be invisible to whatever maintains those counters.
 *
 * Every query is guarded by `to_regclass`, so a database without the schema renders an explained
 * empty state instead of a 500.
 */

export const PAGE_SIZE = 25;

/** Which analytics tables exist here, and how much is in them. */
export async function getAnalyticsHealth() {
  try {
    const { rows } = await db.execute<{
      errors: number | null; users: number | null; misses: number | null; days: number | null;
    }>(sql`
      SELECT
        CASE WHEN to_regclass('analytics.app_err_logs') IS NULL THEN NULL
             ELSE (SELECT COUNT(*) FROM analytics.app_err_logs) END::int        AS errors,
        CASE WHEN to_regclass('analytics.app_users') IS NULL THEN NULL
             ELSE (SELECT COUNT(*) FROM analytics.app_users) END::int           AS users,
        CASE WHEN to_regclass('analytics.missed_words_table') IS NULL THEN NULL
             ELSE (SELECT COUNT(*) FROM analytics.missed_words_table) END::int  AS misses,
        CASE WHEN to_regclass('analytics.bot_daily_report') IS NULL THEN NULL
             ELSE (SELECT COUNT(*) FROM analytics.bot_daily_report) END::int    AS days
    `);
    const r = rows[0];
    return {
      available: true,
      errors: r.errors,
      users: r.users,
      misses: r.misses,
      days: r.days,
    };
  } catch {
    return { available: false, errors: null, users: null, misses: null, days: null };
  }
}

export type ErrorLogRow = {
  id: number;
  date: string | null;
  log: string | null;
  os: string | null;
  email: string | null;
  /** joined from analytics.app_users on email — null when the reporter is not a registered user */
  uniId: string | null;
  batch: number | null;
  dept: string | null;
};

/**
 * App error logs, with the reporter's profile attached.
 *
 * The join is on `email`, which is the only key the error row carries — there is no user id column,
 * so a report from a signed-out user cannot be attributed to anyone.
 */
export async function getErrorLogs(filter: { q?: string; os?: string; page?: number } = {}) {
  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;
  const q = filter.q?.trim() ? `%${filter.q.trim()}%` : null;
  const os = filter.os?.trim() || null;

  try {
    const where = sql`
      WHERE (${q}::text IS NULL OR e.log ILIKE ${q} OR e.email ILIKE ${q} OR e.os ILIKE ${q})
        AND (${os}::text IS NULL OR e.os = ${os})
    `;

    const [rows, total, osFacet] = await Promise.all([
      db.execute<ErrorLogRow & { uni_id: string | null }>(sql`
        SELECT e.id, e.date, e.log, e.os, e.email,
               u.uni_id, u.batch, u.dept
        FROM analytics.app_err_logs e
        LEFT JOIN analytics.app_users u ON lower(u.email) = lower(e.email)
        ${where}
        ORDER BY e.date DESC NULLS LAST, e.id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `),
      db.execute<{ n: number }>(sql`
        SELECT COUNT(*)::int AS n FROM analytics.app_err_logs e ${where}
      `),
      db.execute<{ os: string }>(sql`
        SELECT DISTINCT os FROM analytics.app_err_logs
        WHERE os IS NOT NULL AND trim(os) <> '' ORDER BY os LIMIT 20
      `),
    ]);

    return {
      available: true,
      rows: rows.rows.map((r) => ({
        id: Number(r.id),
        date: r.date ? new Date(r.date).toISOString() : null,
        log: r.log,
        os: r.os,
        email: r.email,
        uniId: r.uni_id,
        batch: r.batch === null ? null : Number(r.batch),
        dept: r.dept,
      })),
      total: Number(total.rows[0].n),
      page,
      pageSize: PAGE_SIZE,
      osOptions: osFacet.rows.map((r) => r.os),
    };
  } catch {
    return { available: false, rows: [], total: 0, page, pageSize: PAGE_SIZE, osOptions: [] };
  }
}

export type AppUserRow = {
  id: number;
  email: string | null;
  uniId: string | null;
  batch: number | null;
  dept: string | null;
  role: string | null;
};

export async function getAppUsers(
  filter: { q?: string; dept?: string; batch?: string; page?: number } = {},
) {
  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;
  const q = filter.q?.trim() ? `%${filter.q.trim()}%` : null;
  const dept = filter.dept?.trim() || null;
  const batch = filter.batch?.trim() ? Number(filter.batch) : null;

  try {
    const where = sql`
      WHERE (${q}::text IS NULL OR email ILIKE ${q} OR uni_id ILIKE ${q})
        AND (${dept}::text IS NULL OR dept = ${dept})
        AND (${batch}::int IS NULL OR batch = ${batch})
    `;

    const [rows, total, depts] = await Promise.all([
      db.execute<AppUserRow & { uni_id: string | null }>(sql`
        SELECT id, email, uni_id, batch, dept, role FROM analytics.app_users
        ${where} ORDER BY id DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `),
      db.execute<{ n: number }>(sql`SELECT COUNT(*)::int AS n FROM analytics.app_users ${where}`),
      db.execute<{ dept: string; n: number }>(sql`
        SELECT dept, COUNT(*)::int AS n FROM analytics.app_users
        WHERE dept IS NOT NULL AND trim(dept) <> '' AND lower(trim(dept)) <> 'null'
        GROUP BY 1 ORDER BY n DESC LIMIT 20
      `),
    ]);

    return {
      available: true,
      rows: rows.rows.map((r) => ({
        id: Number(r.id),
        email: r.email,
        uniId: r.uni_id,
        batch: r.batch === null ? null : Number(r.batch),
        dept: r.dept,
        role: r.role,
      })),
      total: Number(total.rows[0].n),
      page,
      pageSize: PAGE_SIZE,
      deptOptions: depts.rows.map((r) => ({ dept: r.dept, count: Number(r.n) })),
    };
  } catch {
    return { available: false, rows: [], total: 0, page, pageSize: PAGE_SIZE, deptOptions: [] };
  }
}

/**
 * Terms the bot failed to match, grouped by frequency.
 *
 * The table stores one row per miss rather than a counter, so the same term appears thousands of
 * times — grouping is what turns it into a content backlog.
 */
export async function getMissedSearches(filter: { q?: string; page?: number } = {}) {
  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;
  const q = filter.q?.trim() ? `%${filter.q.trim()}%` : null;

  try {
    const where = sql`
      WHERE missed_words IS NOT NULL AND trim(missed_words) <> ''
        AND (${q}::text IS NULL OR missed_words ILIKE ${q})
    `;

    const [rows, total] = await Promise.all([
      db.execute<{ term: string; hits: number }>(sql`
        SELECT missed_words AS term, COUNT(*)::int AS hits
        FROM analytics.missed_words_table ${where}
        GROUP BY 1 ORDER BY hits DESC, term ASC LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `),
      db.execute<{ n: number }>(sql`
        SELECT COUNT(DISTINCT missed_words)::int AS n FROM analytics.missed_words_table ${where}
      `),
    ]);

    return {
      available: true,
      rows: rows.rows.map((r) => ({ term: r.term, hits: Number(r.hits) })),
      total: Number(total.rows[0].n),
      page,
      pageSize: PAGE_SIZE,
    };
  } catch {
    return { available: false, rows: [], total: 0, page, pageSize: PAGE_SIZE };
  }
}

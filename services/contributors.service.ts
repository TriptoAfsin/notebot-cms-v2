import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

/**
 * Contributors: students who submitted notes through the Google Form, keyed by email.
 *
 * Rows are written by the ingest pipeline, not the CMS — n8n calls sync_contributors() after
 * staging submissions, the thank-you step stamps last_acknowledged_at, and the 2019–Jul 2026 form
 * history was loaded once by notebot-automation/scripts/backfill-contributors.js. See
 * drizzle/0008_contributors.sql. This page only reads.
 *
 * Counts combine two sources: form rows from before the pipeline existed (legacy_submissions,
 * fixed at backfill) and `submissions` rows linked by contributor_id (everything since).
 */

export const PAGE_SIZE = 25;

export type ContributorSort = "top" | "recent" | "name";

export type ContributorRow = {
  id: number;
  email: string;
  name: string | null;
  batch: string | null;
  department: string | null;
  submissions: number;
  published: number;
  thanked: number;
  firstSubmittedAt: string | null;
  lastSubmittedAt: string | null;
  lastAcknowledgedAt: string | null;
};

const ORDER: Record<ContributorSort, ReturnType<typeof sql>> = {
  top: sql`submissions DESC, last_submitted_at DESC NULLS LAST`,
  recent: sql`last_submitted_at DESC NULLS LAST`,
  name: sql`lower(coalesce(name, email))`,
};

/** Whether migration 0008 has been applied, so the page can explain instead of erroring. */
async function tableExists() {
  const { rows } = await db.execute<{ ok: boolean }>(sql`SELECT to_regclass('public.contributors') IS NOT NULL AS ok`);
  return rows[0]?.ok ?? false;
}

export async function getContributorStats() {
  if (!(await tableExists())) return null;
  const { rows } = await db.execute<{
    contributors: number; active90: number; legacy: number; thankedPeople: number; emailsSent: number;
  }>(sql`
    SELECT
      (SELECT count(*) FROM contributors)::int                                                      AS contributors,
      (SELECT count(*) FROM contributors WHERE last_submitted_at > now() - interval '90 days')::int  AS "active90",
      (SELECT coalesce(sum(legacy_submissions), 0) FROM contributors)::int                          AS legacy,
      (SELECT count(*) FROM contributors WHERE last_acknowledged_at IS NOT NULL)::int                AS "thankedPeople",
      (SELECT count(*) FROM submissions WHERE ack_status = 'sent')::int                              AS "emailsSent"
  `);
  return rows[0];
}

export async function getContributors({
  q, sort = "top", page = 1,
}: { q?: string; sort?: ContributorSort; page?: number }) {
  if (!(await tableExists())) return { available: false as const, rows: [], total: 0, page: 1, pageSize: PAGE_SIZE };

  const term = q?.trim() ? `%${q.trim()}%` : null;
  const where = term
    ? sql`WHERE c.email ILIKE ${term} OR c.name ILIKE ${term} OR c.batch ILIKE ${term} OR c.department ILIKE ${term}`
    : sql``;
  const safePage = Math.max(1, page);

  const { rows } = await db.execute<ContributorRow & { total: number; last_submitted_at: string | null }>(sql`
    SELECT * FROM (
      SELECT c.id, c.email, c.name, c.batch, c.department,
             (c.legacy_submissions + count(s.id))::int                       AS submissions,
             (count(s.id) FILTER (WHERE s.status = 'done'))::int            AS published,
             (count(s.id) FILTER (WHERE s.ack_status = 'sent'))::int        AS thanked,
             c.first_submitted_at   AS "firstSubmittedAt",
             c.last_submitted_at    AS "lastSubmittedAt",
             c.last_acknowledged_at AS "lastAcknowledgedAt",
             c.last_submitted_at,
             count(*) OVER ()::int  AS total
        FROM contributors c
        LEFT JOIN submissions s ON s.contributor_id = c.id
        ${where}
       GROUP BY c.id
    ) t
    ORDER BY ${ORDER[sort] ?? ORDER.top}
    LIMIT ${PAGE_SIZE} OFFSET ${(safePage - 1) * PAGE_SIZE}
  `);

  return {
    available: true as const,
    // last_submitted_at is selected only so the outer ORDER BY can reach it.
    rows: rows.map(({ total: _total, last_submitted_at: _sort, ...r }) => r as ContributorRow),
    total: rows[0]?.total ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

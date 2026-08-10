import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

/**
 * Dashboard aggregates.
 *
 * Everything here is counted in SQL. The previous version ran `db.select().from(notes)` (and the
 * same for eight more tables) purely to read `.length` — ~4,300 rows over the wire, parsed into JS
 * objects, to render nine integers.
 *
 * Some panels read the `analytics` schema, which lives in this same database but is owned by the
 * legacy analytics API rather than Drizzle. It is queried raw and every analytics panel degrades
 * to `null` if the schema is absent, so a dev database without it still renders the dashboard.
 */

/** Messenger injects these as buttons; they are logged as misses but are not content gaps. */
const MISS_NOISE = ["get started", "i want to learn more", "get_started"];

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const [counts, notesPerLevel, contentByDept, deptCoverage, recentSubmissions, pendingCount] =
    await Promise.all([
      db.execute<{
        levels: number; subjects: number; topics: number; notes: number;
        lab_reports: number; question_banks: number; routines: number;
        syllabuses: number; submissions: number;
      }>(sql`
        SELECT (SELECT COUNT(*) FROM levels)::int          AS levels,
               (SELECT COUNT(*) FROM subjects)::int        AS subjects,
               (SELECT COUNT(*) FROM topics)::int          AS topics,
               (SELECT COUNT(*) FROM notes)::int           AS notes,
               (SELECT COUNT(*) FROM lab_reports)::int     AS lab_reports,
               (SELECT COUNT(*) FROM question_banks)::int  AS question_banks,
               (SELECT COUNT(*) FROM routines)::int        AS routines,
               (SELECT COUNT(*) FROM syllabuses)::int      AS syllabuses,
               (SELECT COUNT(*) FROM note_submissions)::int AS submissions
      `),

      db.execute<{ level: string; notes: number; topics: number }>(sql`
        SELECT l.display_name AS level,
               COUNT(DISTINCT n.id)::int AS notes,
               COUNT(DISTINCT t.id)::int AS topics
        FROM levels l
        LEFT JOIN subjects s ON s.level_id = l.id
        LEFT JOIN topics   t ON t.subject_id = s.id
        LEFT JOIN notes    n ON n.topic_id = t.id
        GROUP BY l.id, l.display_name, l.sort_order
        ORDER BY l.sort_order, l.display_name
      `),

      // Department is not a column — it lives in note metadata, or is embedded in the composed
      // title as "…(Author, DEPT-BATCH, Year)". Metadata wins; the title is the fallback.
      db.execute<{ dept: string; notes: number }>(sql`
        SELECT COALESCE(
                 upper(nullif(trim(metadata->>'department'), '')),
                 upper(substring(title from '[(,]\\s*([A-Za-z.]{2,15})-[0-9]{2}'))
               ) AS dept,
               COUNT(*)::int AS notes
        FROM notes
        WHERE nullif(trim(metadata->>'department'), '') IS NOT NULL
           OR title ~ '[(,]\\s*[A-Za-z.]{2,15}-[0-9]{2}'
        GROUP BY 1
        HAVING COALESCE(
                 upper(nullif(trim(metadata->>'department'), '')),
                 upper(substring(title from '[(,]\\s*([A-Za-z.]{2,15})-[0-9]{2}'))
               ) IS NOT NULL
        ORDER BY notes DESC
        LIMIT 10
      `),

      // How much of the corpus that chart actually speaks for — shown next to it, because a
      // department chart that silently covers 19% of notes reads as though it covers all of them.
      db.execute<{ total: number; tagged: number }>(sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (
                 WHERE nullif(trim(metadata->>'department'), '') IS NOT NULL
                    OR title ~ '[(,]\\s*[A-Za-z.]{2,15}-[0-9]{2}'
               )::int AS tagged
        FROM notes
      `),

      db.execute<{
        id: number; name: string; subject_name: string; topic_name: string;
        status: string; department: string | null; created_at: Date;
      }>(sql`
        SELECT id, name, subject_name, topic_name, status, department, created_at
        FROM note_submissions
        ORDER BY created_at DESC
        LIMIT 8
      `),

      db.execute<{ pending: number }>(sql`
        SELECT COUNT(*) FILTER (WHERE status = 'pending')::int AS pending FROM note_submissions
      `),
    ]);

  const c = counts.rows[0];
  const cov = deptCoverage.rows[0];

  return {
    stats: {
      levels: Number(c.levels),
      subjects: Number(c.subjects),
      topics: Number(c.topics),
      notes: Number(c.notes),
      labReports: Number(c.lab_reports),
      questionBanks: Number(c.question_banks),
      routines: Number(c.routines),
      syllabuses: Number(c.syllabuses),
      submissions: Number(c.submissions),
    },

    perLevel: notesPerLevel.rows.map((r) => ({
      level: r.level,
      notes: Number(r.notes),
      topics: Number(r.topics),
    })),

    contentMix: [
      { kind: "notes", label: "Notes", value: Number(c.notes) },
      { kind: "labReports", label: "Lab Reports", value: Number(c.lab_reports) },
      { kind: "questionBanks", label: "Q. Banks", value: Number(c.question_banks) },
      { kind: "routines", label: "Routines", value: Number(c.routines) },
      { kind: "syllabuses", label: "Syllabuses", value: Number(c.syllabuses) },
    ].filter((d) => d.value > 0),

    contentByDept: contentByDept.rows.map((r) => ({ dept: r.dept, notes: Number(r.notes) })),
    deptCoverage: { total: Number(cov.total), tagged: Number(cov.tagged) },

    submissions: {
      pending: Number(pendingCount.rows[0].pending),
      recent: recentSubmissions.rows.map((s) => ({
        id: s.id,
        name: s.name,
        subjectName: s.subject_name,
        topicName: s.topic_name,
        status: s.status,
        department: s.department,
        createdAt: new Date(s.created_at).toISOString(),
      })),
    },

    analytics: await getAnalyticsPanels(),
  };
}

/**
 * Panels sourced from the legacy `analytics` schema.
 *
 * Returns `null` rather than throwing: the schema is created and written by the separate analytics
 * API, so it can legitimately be missing from a local database, and a missing side-panel must not
 * take down the whole dashboard.
 */
async function getAnalyticsPanels() {
  try {
    const [traffic, audience, missed, totals] = await Promise.all([
      db.execute<{ month: string; app: number; bot: number }>(sql`
        SELECT to_char(date_trunc('month', date), 'YYYY-MM') AS "month",
               COALESCE(SUM(count) FILTER (WHERE platform = 'app'), 0)::int AS app,
               COALESCE(SUM(count) FILTER (WHERE platform = 'bot'), 0)::int AS bot
        FROM analytics.bot_daily_report
        -- truncated to the month boundary, otherwise a mid-month "today" yields 13 buckets
        WHERE date >= (date_trunc('month', CURRENT_DATE) - INTERVAL '11 months')
        GROUP BY 1 ORDER BY 1
      `),

      db.execute<{ dept: string; users: number }>(sql`
        SELECT COALESCE(nullif(trim(dept), ''), 'Unknown') AS dept, COUNT(*)::int AS users
        FROM analytics.app_users
        WHERE dept IS NOT NULL AND trim(dept) <> '' AND lower(trim(dept)) <> 'null'
        GROUP BY 1 ORDER BY users DESC LIMIT 8
      `),

      db.execute<{ term: string; hits: number }>(sql`
        SELECT missed_words AS term, COUNT(*)::int AS hits
        FROM analytics.missed_words_table
        WHERE missed_words IS NOT NULL
          AND trim(missed_words) <> ''
          AND lower(trim(missed_words)) <> ALL(${sql`ARRAY[${sql.join(MISS_NOISE.map((w) => sql`${w}`), sql`, `)}]::text[]`})
        GROUP BY 1 ORDER BY hits DESC LIMIT 12
      `),

      db.execute<{ users: number; misses: number; errors: number }>(sql`
        SELECT (SELECT COUNT(*) FROM analytics.app_users)::int          AS users,
               (SELECT COUNT(*) FROM analytics.missed_words_table)::int AS misses,
               (SELECT COUNT(*) FROM analytics.app_err_logs)::int       AS errors
      `),
    ]);

    const t = totals.rows[0];
    return {
      traffic: traffic.rows.map((r) => ({
        month: r.month,
        app: Number(r.app),
        bot: Number(r.bot),
      })),
      audience: audience.rows.map((r) => ({ dept: r.dept, users: Number(r.users) })),
      missed: missed.rows.map((r) => ({ term: r.term, hits: Number(r.hits) })),
      totals: { users: Number(t.users), misses: Number(t.misses), errors: Number(t.errors) },
    };
  } catch {
    return null;
  }
}

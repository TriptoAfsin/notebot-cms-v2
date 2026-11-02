import { createServerFn } from "@tanstack/react-start";
import { requireSession } from "@/lib/server-fn";

/** Counts shown in the sidebar. One round trip; the dashboard layout caches it for 30s. */
export const getNavCounts = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .handler(async () => {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    const res = await db.execute(sql`
      select
        (select count(*) from notes)::int as notes,
        (select count(*) from lab_reports)::int as lab_reports,
        (select count(*) from question_banks)::int as question_banks,
        (select count(*) from bot_flows)::int as bot_flows,
        (select count(*) from note_submissions where status = 'pending')::int as pending
    `);
    const row = (res.rows?.[0] ?? {}) as Record<string, number>;
    return {
      notes: row.notes ?? 0,
      labReports: row.lab_reports ?? 0,
      questionBanks: row.question_banks ?? 0,
      botFlows: row.bot_flows ?? 0,
      pending: row.pending ?? 0,
    };
  });

export type NavCounts = Awaited<ReturnType<typeof getNavCounts>>;

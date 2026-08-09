import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export type AuditFilter = {
  entityType?: string;
  action?: string;
  actorEmail?: string;
  page?: number;
  pageSize?: number;
};

/**
 * Paginated server-side. The other tables in this CMS fetch every row and slice in the client,
 * which is fine for a few hundred subjects but not for a log that grows with every edit.
 */
export async function getAuditLogs(filter: AuditFilter = {}) {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, filter.pageSize ?? 25));

  const where = [
    filter.entityType ? eq(auditLogs.entityType, filter.entityType) : undefined,
    filter.action ? eq(auditLogs.action, filter.action) : undefined,
    filter.actorEmail ? eq(auditLogs.actorEmail, filter.actorEmail) : undefined,
  ].filter(Boolean);
  const clause = where.length ? and(...where) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(auditLogs).where(clause)
      .orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs).where(clause),
  ]);

  return { rows, total: count, page, pageSize };
}

/** Distinct values for the filter chips, so the UI never invents an option that has no rows. */
export async function getAuditFacets() {
  const [types, actors] = await Promise.all([
    db.selectDistinct({ v: auditLogs.entityType }).from(auditLogs).orderBy(auditLogs.entityType),
    db.selectDistinct({ v: auditLogs.actorEmail }).from(auditLogs).orderBy(auditLogs.actorEmail),
  ]);
  return {
    entityTypes: types.map((t) => t.v).filter(Boolean) as string[],
    actors: actors.map((a) => a.v).filter(Boolean) as string[],
  };
}

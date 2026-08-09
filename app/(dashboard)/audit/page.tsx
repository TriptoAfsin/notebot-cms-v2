import { requireUser } from "@/lib/session";
import { getAuditFacets, getAuditLogs } from "@/services/audit-logs.service";
import { AuditTable } from "./audit-table";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string; actor?: string; page?: string }>;
}) {
  if (!(await requireUser())) {
    return <p className="text-sm text-muted-foreground">Sign in to view the audit log.</p>;
  }

  const sp = await searchParams;
  const [data, facets] = await Promise.all([
    getAuditLogs({
      entityType: sp.entityType,
      action: sp.action,
      actorEmail: sp.actor,
      page: sp.page ? parseInt(sp.page) : 1,
    }),
    getAuditFacets(),
  ]);

  return <AuditTable data={data} facets={facets} current={sp} />;
}

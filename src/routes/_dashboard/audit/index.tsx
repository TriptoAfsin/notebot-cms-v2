import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import { TableSkeleton } from "@/features/dashboard/skeletons";
import { AuditTable } from "@/features/dashboard/audit/audit-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const { getAuditFacets, getAuditLogs } = await import("@/services/audit-logs.service");
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
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
    return { data, facets, sp };
  });

export const Route = createFileRoute("/_dashboard/audit/")({
  pendingComponent: TableSkeleton,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data, facets, sp } = Route.useLoaderData();
  return <AuditTable data={data} facets={facets} current={sp} />;
}

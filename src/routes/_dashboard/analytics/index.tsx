import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { AnalyticsView } from "@/features/dashboard/analytics/analytics-view";


type Search = {
  tab?: string;
  q?: string;
  os?: string;
  dept?: string;
  batch?: string;
  page?: string;
};

// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const {
  getAnalyticsHealth, getAppUsers, getErrorLogs, getMissedSearches,
} = await import("@/services/analytics.service");
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const sp = await searchParams;
    const tab = sp.tab === "users" || sp.tab === "missed" ? sp.tab : "errors";
    const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;
    const health = await getAnalyticsHealth();
    const errors = tab === "errors" ? await getErrorLogs({ q: sp.q, os: sp.os, page }) : null;
    const users = tab === "users" ? await getAppUsers({ q: sp.q, dept: sp.dept, batch: sp.batch, page }) : null;
    const missed = tab === "missed" ? await getMissedSearches({ q: sp.q, page }) : null;
    return { tab, sp, health, errors, users, missed };
  });

export const Route = createFileRoute("/_dashboard/analytics/")({
  head: () => ({ meta: [{ title: "Analytics · NoteBot CMS" }] }),
  pendingComponent: DashboardLoading,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { tab, sp, health, errors, users, missed } = Route.useLoaderData();
  return (
    <AnalyticsView
      tab={tab}
      current={sp}
      health={health}
      errors={errors}
      users={users}
      missed={missed}
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { DashboardView } from "@/features/dashboard/dashboard/dashboard-view";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    // Call the implementation directly: this handler already runs on the server behind
    // requireSession, and a server function that is only ever called from server code is not
    // registered by the production build ("Server function info not found").
    const { getDashboardDataAction } = await import("@/actions/_impl/dashboard.action");
    const data = await getDashboardDataAction();
    return { data };
  });

export const Route = createFileRoute("/_dashboard/dashboard/")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  return <DashboardView data={data} />;
}

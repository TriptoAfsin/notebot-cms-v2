import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getRoutinesAction } from "@/actions/routines.action";
import { getLevelsAction } from "@/actions/levels.action";
import { RoutinesTable } from "@/features/dashboard/routines/routines-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const [routines, levels] = await Promise.all([getRoutinesAction(), getLevelsAction()]);
    return { routines, levels };
  });

export const Route = createFileRoute("/_dashboard/routines/")({
  pendingComponent: DashboardLoading,
  loader: ({ }) => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { routines, levels } = Route.useLoaderData();
  return <RoutinesTable routines={routines} levels={levels} />;
}

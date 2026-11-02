import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getLevelsAction } from "@/actions/levels.action";
import { CreateRoutineForm } from "@/features/dashboard/routines/new/create-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const levels = await getLevelsAction();
    return { levels };
  });

export const Route = createFileRoute("/_dashboard/routines/new")({
  pendingComponent: DashboardLoading,
  loader: ({ }) => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { levels } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Routine</h1>
      <CreateRoutineForm levels={levels} />
    </div>
  );
}

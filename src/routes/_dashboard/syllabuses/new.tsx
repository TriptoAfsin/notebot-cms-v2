import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getSyllabusesAction } from "@/actions/syllabuses.action";
import { CreateSyllabusForm } from "@/features/dashboard/syllabuses/new/create-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const existing = await getSyllabusesAction();
    return { existing };
  });

export const Route = createFileRoute("/_dashboard/syllabuses/new")({
  pendingComponent: DashboardLoading,
  loader: ({ }) => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { existing } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Syllabus Entry</h1>
      <CreateSyllabusForm existing={existing} />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { notFound } from "@/lib/navigation";
import { getSubjectByIdAction } from "@/actions/subjects.action";
import { getLevelsAction } from "@/actions/levels.action";
import { EditSubjectForm } from "@/features/dashboard/subjects/[id]/edit-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const params = thenable(__params);
    const { id } = await params;
    const [subject, levels] = await Promise.all([
    getSubjectByIdAction(parseInt(id)),
    getLevelsAction(),
  ]);
    if (!subject) {
    notFound();
  }
    return { subject, levels };
  });

export const Route = createFileRoute("/_dashboard/subjects/$id")({
  pendingComponent: DashboardLoading,
  loader: ({ params, }) => loadPage({ data: packArgs([params, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { subject, levels } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Subject</h1>
      <EditSubjectForm subject={subject} levels={levels} />
    </div>
  );
}

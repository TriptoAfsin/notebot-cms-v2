import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { notFound } from "@/lib/navigation";
import { getSyllabusByIdAction } from "@/actions/syllabuses.action";
import { EditSyllabusForm } from "@/features/dashboard/syllabuses/[id]/edit-form";


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
    const syllabus = await getSyllabusByIdAction(parseInt(id));
    if (!syllabus) {
    notFound();
  }
    return { syllabus };
  });

export const Route = createFileRoute("/_dashboard/syllabuses/$id")({
  pendingComponent: DashboardLoading,
  loader: ({ params, }) => loadPage({ data: packArgs([params, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { syllabus } = Route.useLoaderData();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Syllabus Entry</h1>
      <EditSyllabusForm syllabus={syllabus} />
    </div>
  );
}

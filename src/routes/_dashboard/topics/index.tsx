import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getTopicsAction } from "@/actions/topics.action";
import { getSubjectsAction } from "@/actions/subjects.action";
import { TopicsTable } from "@/features/dashboard/topics/topics-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const { subjectId } = await searchParams;
    const subjectIdNum = subjectId ? parseInt(subjectId) : undefined;
    const [topics, subjects] = await Promise.all([
    getTopicsAction(subjectIdNum),
    getSubjectsAction(),
  ]);
    return { topics, subjects, subjectIdNum };
  });

export const Route = createFileRoute("/_dashboard/topics/")({
  pendingComponent: DashboardLoading,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { topics, subjects, subjectIdNum } = Route.useLoaderData();
  return <TopicsTable topics={topics} subjects={subjects} currentSubjectId={subjectIdNum} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import { TableSkeleton } from "@/features/dashboard/skeletons";
import { getSubjectsAction } from "@/actions/subjects.action";
import { getLevelsAction } from "@/actions/levels.action";
import { SubjectsTable } from "@/features/dashboard/subjects/subjects-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const { levelId } = await searchParams;
    const parsedLevelId = levelId ? parseInt(levelId) : undefined;
    const [subjects, levels] = await Promise.all([getSubjectsAction(parsedLevelId), getLevelsAction()]);
    return { subjects, levels, parsedLevelId };
  });

export const Route = createFileRoute("/_dashboard/subjects/")({
  pendingComponent: TableSkeleton,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { subjects, levels, parsedLevelId } = Route.useLoaderData();
  return <SubjectsTable subjects={subjects} levels={levels} currentLevelId={parsedLevelId} />;
}

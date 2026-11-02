import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import { TableSkeleton } from "@/features/dashboard/skeletons";
import { getSyllabusesAction, getSyllabusBatchesAction } from "@/actions/syllabuses.action";
import { SyllabusesTable } from "@/features/dashboard/syllabuses/syllabuses-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const { batch } = await searchParams;
    const [syllabuses, batches] = await Promise.all([
    getSyllabusesAction(batch),
    getSyllabusBatchesAction(),
  ]);
    return { syllabuses, batches, batch };
  });

export const Route = createFileRoute("/_dashboard/syllabuses/")({
  pendingComponent: TableSkeleton,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { syllabuses, batches, batch } = Route.useLoaderData();
  return <SyllabusesTable syllabuses={syllabuses} batches={batches} currentBatch={batch} />;
}

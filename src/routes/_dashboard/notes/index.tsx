import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getNotesAction } from "@/actions/notes.action";
import { getTopicsAction } from "@/actions/topics.action";
import { NotesTable } from "@/features/dashboard/notes/notes-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const { topicId } = await searchParams;
    const parsedTopicId = topicId ? parseInt(topicId) : undefined;
    const [notes, topics] = await Promise.all([getNotesAction(parsedTopicId), getTopicsAction()]);
    return { notes, topics, parsedTopicId };
  });

export const Route = createFileRoute("/_dashboard/notes/")({
  pendingComponent: DashboardLoading,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { notes, topics, parsedTopicId } = Route.useLoaderData();
  return <NotesTable notes={notes} topics={topics} currentTopicId={parsedTopicId} />;
}

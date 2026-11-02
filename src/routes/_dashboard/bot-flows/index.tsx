import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import { TableSkeleton } from "@/features/dashboard/skeletons";
import { getBotFlowsAction, getRetirableFlowsAction } from "@/actions/bot-flows.action";
import { BotFlowsView } from "@/features/dashboard/bot-flows/bot-flows-view";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const sp = await searchParams;
    const [data, retirable] = await Promise.all([
    getBotFlowsAction({
      q: sp.q, kind: sp.kind, status: sp.status,
      page: sp.page ? parseInt(sp.page, 10) || 1 : 1,
    }),
    getRetirableFlowsAction(),
  ]);
    return { data, retirable, sp };
  });

export const Route = createFileRoute("/_dashboard/bot-flows/")({
  head: () => ({ meta: [{ title: "Bot Flows · NoteBot CMS" }] }),
  pendingComponent: TableSkeleton,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data, retirable, sp } = Route.useLoaderData();
  return <BotFlowsView data={data} retirable={retirable} current={sp} />;
}

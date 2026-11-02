import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getLevelsAction } from "@/actions/levels.action";
import { ContentForm } from "@/features/dashboard/content/new/content-form";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const { getTaxonomy } = await import("@/services/taxonomy.service");
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const searchParams = thenable(__search);
    const [levels, taxonomy, sp] = await Promise.all([
    getLevelsAction(),
    getTaxonomy(),
    searchParams,
  ]);
    return { levels, taxonomy, sp };
  });

export const Route = createFileRoute("/_dashboard/content/new")({
  pendingComponent: DashboardLoading,
  validateSearch: searchAsStrings,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, }) => loadPage({ data: packArgs([{}, deps]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { levels, taxonomy, sp } = Route.useLoaderData();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Add content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Level, subject, topic and the note itself in one step — each created only if it does not
          already exist.
        </p>
      </div>
      <ContentForm
        levels={levels}
        departments={taxonomy.departments}
        noteKinds={taxonomy.noteKinds}
        batches={taxonomy.batches}
        initialTopicName={sp.topic?.slice(0, 200) ?? ""}
      />
    </div>
  );
}

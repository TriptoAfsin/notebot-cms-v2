import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { getTaxonomyAction } from "@/actions/taxonomy.action";
import { DEFAULT_TAXONOMY, type TaxonomyField } from "@/lib/taxonomy";
import { TaxonomyEditor } from "@/features/dashboard/settings/taxonomy/taxonomy-editor";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const { getTaxonomyUsage } = await import("@/services/taxonomy.service");
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const taxonomy = (await getTaxonomyAction()) ?? DEFAULT_TAXONOMY;
    const fields: TaxonomyField[] = ["departments", "batches", "levels", "noteKinds"];
    const entries = await Promise.all(
    fields.map(async (f) => [f, await getTaxonomyUsage(f, taxonomy[f])] as const)
  );
    return { taxonomy, entries };
  });

export const Route = createFileRoute("/_dashboard/settings/taxonomy")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { taxonomy, entries } = Route.useLoaderData();
  return <TaxonomyEditor taxonomy={taxonomy} usage={Object.fromEntries(entries)} />;
}

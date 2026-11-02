import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { getDeliveriesAction, getWebhooksAction } from "@/actions/webhooks.action";
import { WebhooksView } from "@/features/dashboard/webhooks/webhooks-view";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const [hooks, deliveries] = await Promise.all([getWebhooksAction(), getDeliveriesAction()]);
    return { hooks, deliveries };
  });

export const Route = createFileRoute("/_dashboard/webhooks/")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { hooks, deliveries } = Route.useLoaderData();
  return <WebhooksView hooks={hooks} deliveries={deliveries} />;
}

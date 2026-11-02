import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import { getFlowMapAction } from "@/actions/bot-flows.action";
import { FlowMapView } from "@/features/dashboard/bot-flows/flow-map";
import { BotFlowsTabs } from "@/features/dashboard/bot-flows/tabs";

export const Route = createFileRoute("/_dashboard/bot-flows/map")({
  head: () => ({ meta: [{ title: "Flow map · NoteBot CMS" }] }),
  pendingComponent: DashboardLoading,
  loader: () => getFlowMapAction(),
  // The map is rebuilt from every flow; don't refetch it on each visit within a minute.
  staleTime: 60_000,
  component: RouteComponent,
});

function RouteComponent() {
  const map = Route.useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Bot flows</h1>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground">
            Every button and quick reply, and where the engine sends it. Click a flow to see its links.
          </p>
        </div>
        <BotFlowsTabs active="map" />
      </div>
      {map ? <FlowMapView map={map} /> : <p className="text-sm text-muted-foreground">Could not load the map.</p>}
    </div>
  );
}

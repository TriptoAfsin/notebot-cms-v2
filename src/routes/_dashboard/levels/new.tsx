import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import Page from "@/features/dashboard/levels/new/page";

export const Route = createFileRoute("/_dashboard/levels/new")({
  pendingComponent: DashboardLoading,
  component: Page,
});

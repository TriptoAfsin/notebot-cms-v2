import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import Page from "@/features/dashboard/results/new/page";

export const Route = createFileRoute("/_dashboard/results/new")({
  pendingComponent: DashboardLoading,
  component: Page,
});

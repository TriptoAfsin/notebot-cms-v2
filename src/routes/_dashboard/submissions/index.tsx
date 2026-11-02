import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import Page from "@/features/dashboard/submissions/page";

export const Route = createFileRoute("/_dashboard/submissions/")({
  pendingComponent: DashboardLoading,
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import Page from "@/features/dashboard/submissions/[id]/page";

export const Route = createFileRoute("/_dashboard/submissions/$id")({
  pendingComponent: DashboardLoading,
  component: Page,
});

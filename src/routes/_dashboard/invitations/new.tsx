import { createFileRoute } from "@tanstack/react-router";
import DashboardLoading from "@/features/dashboard/loading";
import Page from "@/features/dashboard/invitations/new/page";

export const Route = createFileRoute("/_dashboard/invitations/new")({
  pendingComponent: DashboardLoading,
  component: Page,
});

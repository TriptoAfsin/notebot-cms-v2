import { createFileRoute } from "@tanstack/react-router";
import { FormSkeleton } from "@/features/dashboard/skeletons";
import Page from "@/features/dashboard/invitations/new/page";

export const Route = createFileRoute("/_dashboard/invitations/new")({
  pendingComponent: FormSkeleton,
  component: Page,
});

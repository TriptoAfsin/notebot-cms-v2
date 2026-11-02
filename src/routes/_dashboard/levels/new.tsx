import { createFileRoute } from "@tanstack/react-router";
import { FormSkeleton } from "@/features/dashboard/skeletons";
import Page from "@/features/dashboard/levels/new/page";

export const Route = createFileRoute("/_dashboard/levels/new")({
  pendingComponent: FormSkeleton,
  component: Page,
});

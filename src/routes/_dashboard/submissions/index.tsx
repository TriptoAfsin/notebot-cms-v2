import { createFileRoute } from "@tanstack/react-router";
import { QueueSkeleton } from "@/features/dashboard/skeletons";
import Page from "@/features/dashboard/submissions/page";

export const Route = createFileRoute("/_dashboard/submissions/")({
  pendingComponent: QueueSkeleton,
  component: Page,
});

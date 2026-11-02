import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/submit/track/page";

export const Route = createFileRoute("/submit/track")({
  component: Page,
});

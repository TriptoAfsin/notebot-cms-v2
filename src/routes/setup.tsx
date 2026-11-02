import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/setup/page";

export const Route = createFileRoute("/setup")({
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/invite/[token]/page";

export const Route = createFileRoute("/invite/$token")({
  component: Page,
});

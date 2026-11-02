import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFound from "@/features/not-found";
import { RouteError } from "@/components/route-error";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // No View Transitions: they snapshot and crossfade the whole document, so the sidebar and
    // header blinked on every click. The dashboard layout fades only its content area instead.
    defaultPreload: "intent",
    // Preloaded data stays fresh long enough to be used by the click that follows the hover.
    defaultPreloadStaleTime: 10_000,
    // Skeletons after 200ms (default 1s), held at least 350ms so they never flicker.
    defaultPendingMs: 200,
    defaultPendingMinMs: 350,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouteError,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

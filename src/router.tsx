import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFound from "@/features/not-found";
import { RouteError } from "@/components/route-error";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultViewTransition: true,
    defaultPreload: "intent",
    // Skeletons after 250ms (default 1s), held at least 400ms so they never flicker.
    defaultPendingMs: 250,
    defaultPendingMinMs: 400,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouteError,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

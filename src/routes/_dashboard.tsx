import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { createFileRoute, Outlet, redirect, useRouter, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth-guard";
import { cachedUser, rememberUser } from "@/lib/auth-cache";
import { getNavCounts } from "@/lib/nav-counts";

/**
 * Authenticated shell. Unlike the old proxy.ts (which only checked that a session cookie
 * existed), this validates the session before any dashboard route renders. Server functions are
 * still guarded individually by `requireSession`, since they are reachable without this route.
 *
 * beforeLoad runs on every navigation and every hover preload, so in the browser the result is
 * reused for a minute (lib/auth-cache.ts). Without that, each click waited on up to three
 * session round trips before the page could change.
 */
export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ location }) => {
    const user = cachedUser() ?? (await getCurrentUser());
    if (!user) {
      throw redirect({ to: "/login", search: { next: location.href } as never });
    }
    rememberUser(user);
    return { user };
  },
  // Sidebar counts: refreshed at most every 30s, and after any mutation (router.invalidate).
  loader: () => getNavCounts(),
  staleTime: 30_000,
  component: DashboardLayout,
});

function DashboardLayout() {
  const counts = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  return (
    <div className="flex min-h-screen bg-background">
      {/* self-stretch gives the sticky aside inside room to travel */}
      <div className="hidden self-stretch md:block">
        <AppSidebar counts={counts} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} counts={counts} />
        <main className="flex-1 p-4 md:p-6">
          <ContentArea />
        </main>
      </div>
    </div>
  );
}

const PENDING_MS = 200; // show a skeleton only for navigations slower than this
const PENDING_MIN_MS = 350; // once shown, keep it long enough not to flicker

/**
 * The content area. The sidebar and header sit outside it and never re-render on navigation.
 *
 * Skeletons are shown here rather than left to the router: in this TanStack version the router
 * applies its pending state inside a React transition that reuses the same Suspense boundary, so
 * React keeps the *old* page on screen until the new one is ready. The breadcrumb and sidebar had
 * already moved on, so the screen showed one page's content under another page's name, then
 * swapped all at once. Here, once a navigation to a new path has taken PENDING_MS, the target
 * route's own `pendingComponent` replaces the old page.
 *
 * The page fades in (160ms, opacity only) when it changes or when its skeleton gives way to it.
 * Search-param changes (filters, paging) don't fade or skeleton. Web Animations rather than a
 * React key, so nothing remounts and in-page state survives.
 */
function ContentArea() {
  const router = useRouter();
  const pendingPath = useRouterState({
    select: (s) =>
      s.isLoading && s.resolvedLocation && s.location.pathname !== s.resolvedLocation.pathname ? s.location.pathname : null,
  });
  const resolvedPath = useRouterState({ select: (s) => s.resolvedLocation?.pathname });
  const [skeleton, setSkeleton] = useState<{ path: string; Comp: ComponentType; since: number } | null>(null);

  useEffect(() => {
    if (!pendingPath) return;
    const t = setTimeout(() => {
      const Comp = router.getMatchedRoutes(pendingPath)[2]?.options.pendingComponent as ComponentType | undefined;
      if (Comp) setSkeleton({ path: pendingPath, Comp, since: Date.now() });
    }, PENDING_MS);
    return () => clearTimeout(t);
  }, [pendingPath, router]);

  useEffect(() => {
    if (!skeleton || pendingPath === skeleton.path) return;
    const t = setTimeout(() => setSkeleton(null), Math.max(0, skeleton.since + PENDING_MIN_MS - Date.now()));
    return () => clearTimeout(t);
  }, [pendingPath, skeleton]);

  const ref = useRef<HTMLDivElement>(null);
  const shown = skeleton ? null : resolvedPath;
  const last = useRef(shown);
  useLayoutEffect(() => {
    if (shown === last.current) return;
    const prev = last.current;
    last.current = shown;
    const el = ref.current;
    if (shown == null || prev === undefined || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }, [shown]);

  if (skeleton) return <skeleton.Comp />;
  return (
    <div ref={ref}>
      <Outlet />
    </div>
  );
}

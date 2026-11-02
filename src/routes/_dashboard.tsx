import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth-guard";
import { getNavCounts } from "@/lib/nav-counts";

/**
 * Authenticated shell. Unlike the old proxy.ts (which only checked that a session cookie
 * existed), this validates the session before any dashboard route renders. Server functions are
 * still guarded individually by `requireSession`, since they are reachable without this route.
 */
export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { next: location.href } as never });
    }
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

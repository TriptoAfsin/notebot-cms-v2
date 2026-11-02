import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth-guard";

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
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* self-stretch gives the sticky aside inside room to travel */}
      <div className="hidden self-stretch md:block">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

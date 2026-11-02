import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import { searchAsStrings, thenable } from "@/lib/route-helpers";
import DashboardLoading from "@/features/dashboard/loading";
import { getUsers } from "@/actions/users.action";
import { UsersTable } from "@/features/dashboard/users/users-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const result = await getUsers();
    const users = result.data || [];
    return { users };
  });

export const Route = createFileRoute("/_dashboard/users/")({
  pendingComponent: DashboardLoading,
  loader: ({ }) => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { users } = Route.useLoaderData();
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Users are created through invitations
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}

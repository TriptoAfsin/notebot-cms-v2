import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { packArgs, passThrough, requireSession, unpackArgs } from "@/lib/server-fn";
import DashboardLoading from "@/features/dashboard/loading";
import { Link } from "@/components/link";
import { getInvitations } from "@/actions/invitations.action";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvitationsTable } from "@/features/dashboard/invitations/invitations-table";


// Data for this page. Runs on the server only (also during client-side navigation), so it may
// call services directly. Ported from the Next.js server component's body.
const loadPage = createServerFn({ method: "GET" })
  .middleware([requireSession])
  .validator(passThrough)
  .handler(async ({ data: __input }) => {
    const [__params, __search] = unpackArgs(__input) as [Record<string, string>, Record<string, string>];
    void __params; void __search;
    const result = await getInvitations();
    const invitations = result.data || [];
    return { invitations };
  });

export const Route = createFileRoute("/_dashboard/invitations/")({
  pendingComponent: DashboardLoading,
  loader: () => loadPage({ data: packArgs([{}, {}]) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { invitations } = Route.useLoaderData();
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Invitations</h1>
        <Link href="/invitations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invitation
          </Button>
        </Link>
      </div>

      <InvitationsTable invitations={invitations} />
    </div>
  );
}

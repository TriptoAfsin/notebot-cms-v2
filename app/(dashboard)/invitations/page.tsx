import { Link } from "next-view-transitions";
import { getInvitations } from "@/actions/invitations.action";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvitationsTable } from "./invitations-table";

export default async function InvitationsPage() {
  const result = await getInvitations();
  const invitations = result.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Invitations</h1>
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

import { Link } from "next-view-transitions";
import { getInvitations } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import { DeleteInvitationButton } from "./delete-button";

function getStatus(invitation: {
  usedBy: string | null;
  expiresAt: Date;
}) {
  if (invitation.usedBy) return "used";
  if (new Date() > new Date(invitation.expiresAt)) return "expired";
  return "active";
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "used":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          Used
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          Expired
        </Badge>
      );
    default:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
      );
  }
}

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

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24">Role</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-28">Expires</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map(
              (inv: {
                id: number;
                token: string;
                email: string | null;
                role: string;
                usedBy: string | null;
                expiresAt: Date;
                createdAt: Date;
              }) => {
                const status = getStatus(inv);
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">
                      {inv.token.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm">{inv.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={inv.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {status === "active" && (
                          <CopyLinkButton token={inv.token} />
                        )}
                        <DeleteInvitationButton id={inv.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
            {invitations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No invitations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

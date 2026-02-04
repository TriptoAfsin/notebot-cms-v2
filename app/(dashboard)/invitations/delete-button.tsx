"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteInvitation } from "@/actions/invitations.action";

export function DeleteInvitationButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Invitation"
      onDelete={() => deleteInvitation(id)}
    />
  );
}

"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteNoteAction } from "@/actions/notes";

export function DeleteNoteButton({ id, topicId }: { id: number; topicId: number }) {
  return (
    <DeleteDialog
      itemName="Note"
      onDelete={() => deleteNoteAction(id, topicId)}
    />
  );
}

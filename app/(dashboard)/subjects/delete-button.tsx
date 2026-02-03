"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteSubjectAction } from "@/actions/subjects";

export function DeleteSubjectButton({ id, levelId }: { id: number; levelId: number }) {
  return (
    <DeleteDialog
      itemName="Subject"
      onDelete={() => deleteSubjectAction(id, levelId)}
    />
  );
}

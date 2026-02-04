"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteTopicAction } from "@/actions/topics.action";

export function DeleteTopicButton({ id, subjectId }: { id: number; subjectId: number }) {
  return (
    <DeleteDialog
      itemName="Topic"
      onDelete={() => deleteTopicAction(id, subjectId)}
    />
  );
}

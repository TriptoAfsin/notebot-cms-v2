"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteLevelAction } from "@/actions/levels";

export function DeleteLevelButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Level"
      onDelete={() => deleteLevelAction(id)}
    />
  );
}

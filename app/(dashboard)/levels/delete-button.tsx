"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteLevelAction } from "@/actions/levels.action";

export function DeleteLevelButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Level"
      onDelete={() => deleteLevelAction(id)}
    />
  );
}

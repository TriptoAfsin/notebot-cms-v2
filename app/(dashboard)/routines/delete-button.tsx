"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteRoutineAction } from "@/actions/routines";

export function DeleteRoutineButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Routine"
      onDelete={() => deleteRoutineAction(id)}
    />
  );
}

"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteResultAction } from "@/actions/results.action";

export function DeleteResultButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Result"
      onDelete={() => deleteResultAction(id)}
    />
  );
}

"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteSyllabusAction } from "@/actions/syllabuses.action";

export function DeleteSyllabusButton({ id }: { id: number }) {
  return (
    <DeleteDialog
      itemName="Syllabus Entry"
      onDelete={() => deleteSyllabusAction(id)}
    />
  );
}

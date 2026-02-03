"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteQuestionBankAction } from "@/actions/question-banks";

export function DeleteQuestionBankButton({ id, levelId }: { id: number; levelId: number }) {
  return (
    <DeleteDialog
      itemName="Question Bank"
      onDelete={() => deleteQuestionBankAction(id, levelId)}
    />
  );
}

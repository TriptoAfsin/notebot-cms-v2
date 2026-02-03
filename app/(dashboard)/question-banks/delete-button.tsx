"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteQuestionBankAction } from "@/actions/questionBanks";

export function DeleteQuestionBankButton({ id, levelId }: { id: number; levelId: number }) {
  return (
    <DeleteDialog
      itemName="Question Bank"
      onDelete={() => deleteQuestionBankAction(id, levelId)}
    />
  );
}

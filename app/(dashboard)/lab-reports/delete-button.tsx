"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteLabReportAction } from "@/actions/labReports";

export function DeleteLabReportButton({ id, levelId }: { id: number; levelId: number }) {
  return (
    <DeleteDialog
      itemName="Lab Report"
      onDelete={() => deleteLabReportAction(id, levelId)}
    />
  );
}

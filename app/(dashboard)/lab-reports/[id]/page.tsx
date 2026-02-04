import { notFound } from "next/navigation";
import { getLabReportByIdAction } from "@/actions/lab-reports.action";
import { getLevelsAction } from "@/actions/levels.action";
import { EditLabReportForm } from "./edit-form";

export default async function EditLabReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [labReport, levels] = await Promise.all([
    getLabReportByIdAction(parseInt(id)),
    getLevelsAction(),
  ]);

  if (!labReport) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Lab Report</h1>
      <EditLabReportForm labReport={labReport} levels={levels} />
    </div>
  );
}

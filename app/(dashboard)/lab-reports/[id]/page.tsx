import { notFound } from "next/navigation";
import { getLabReportById } from "@/services/lab-reports";
import { getLevels } from "@/services/levels";
import { EditLabReportForm } from "./edit-form";

export default async function EditLabReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [labReport, levels] = await Promise.all([
    getLabReportById(parseInt(id)),
    getLevels(),
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

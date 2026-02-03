import { getLevels } from "@/services/levels";
import { CreateLabReportForm } from "./create-form";

export default async function NewLabReportPage() {
  const levels = await getLevels();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Lab Report</h1>
      <CreateLabReportForm levels={levels} />
    </div>
  );
}

import { getLabReports } from "@/services/lab-reports";
import { getLevels } from "@/services/levels";
import { LabReportsTable } from "./lab-reports-table";

export default async function LabReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [labReports, levels] = await Promise.all([getLabReports(parsedLevelId), getLevels()]);
  return <LabReportsTable labReports={labReports} levels={levels} currentLevelId={parsedLevelId} />;
}

import { getLabReportsAction } from "@/actions/lab-reports";
import { getLevelsAction } from "@/actions/levels";
import { LabReportsTable } from "./lab-reports-table";

export default async function LabReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [labReports, levels] = await Promise.all([getLabReportsAction(parsedLevelId), getLevelsAction()]);
  return <LabReportsTable labReports={labReports} levels={levels} currentLevelId={parsedLevelId} />;
}

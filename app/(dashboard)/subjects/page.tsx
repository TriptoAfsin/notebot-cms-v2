import { getSubjectsAction } from "@/actions/subjects";
import { getLevelsAction } from "@/actions/levels";
import { SubjectsTable } from "./subjects-table";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [subjects, levels] = await Promise.all([getSubjectsAction(parsedLevelId), getLevelsAction()]);

  return <SubjectsTable subjects={subjects} levels={levels} currentLevelId={parsedLevelId} />;
}

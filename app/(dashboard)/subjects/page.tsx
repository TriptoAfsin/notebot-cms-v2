import { getSubjects } from "@/services/subjects";
import { getLevels } from "@/services/levels";
import { SubjectsTable } from "./subjects-table";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [subjects, levels] = await Promise.all([getSubjects(parsedLevelId), getLevels()]);

  return <SubjectsTable subjects={subjects} levels={levels} currentLevelId={parsedLevelId} />;
}

import { getQuestionBanks } from "@/services/question-banks";
import { getLevels } from "@/services/levels";
import { QuestionBanksTable } from "./question-banks-table";

export default async function QuestionBanksPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [questionBanks, levels] = await Promise.all([getQuestionBanks(parsedLevelId), getLevels()]);
  return <QuestionBanksTable questionBanks={questionBanks} levels={levels} currentLevelId={parsedLevelId} />;
}

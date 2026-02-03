import { getQuestionBanksAction } from "@/actions/question-banks";
import { getLevelsAction } from "@/actions/levels";
import { QuestionBanksTable } from "./question-banks-table";

export default async function QuestionBanksPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [questionBanks, levels] = await Promise.all([getQuestionBanksAction(parsedLevelId), getLevelsAction()]);
  return <QuestionBanksTable questionBanks={questionBanks} levels={levels} currentLevelId={parsedLevelId} />;
}

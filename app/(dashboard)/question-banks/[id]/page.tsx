import { notFound } from "next/navigation";
import { getQuestionBankByIdAction } from "@/actions/question-banks.action";
import { getLevelsAction } from "@/actions/levels.action";
import { EditQuestionBankForm } from "./edit-form";

export default async function EditQuestionBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [questionBank, levels] = await Promise.all([
    getQuestionBankByIdAction(parseInt(id)),
    getLevelsAction(),
  ]);

  if (!questionBank) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Question Bank</h1>
      <EditQuestionBankForm questionBank={questionBank} levels={levels} />
    </div>
  );
}

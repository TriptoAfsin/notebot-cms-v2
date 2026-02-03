import { getLevelsAction } from "@/actions/levels";
import { CreateQuestionBankForm } from "./create-form";

export default async function NewQuestionBankPage() {
  const levels = await getLevelsAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Question Bank</h1>
      <CreateQuestionBankForm levels={levels} />
    </div>
  );
}

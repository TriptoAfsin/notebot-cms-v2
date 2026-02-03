import { getLevelsAction } from "@/actions/levels";
import { CreateSubjectForm } from "./create-form";

export default async function NewSubjectPage() {
  const levels = await getLevelsAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Subject</h1>
      <CreateSubjectForm levels={levels} />
    </div>
  );
}

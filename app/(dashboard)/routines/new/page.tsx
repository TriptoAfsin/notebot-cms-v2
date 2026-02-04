import { getLevelsAction } from "@/actions/levels.action";
import { CreateRoutineForm } from "./create-form";

export default async function NewRoutinePage() {
  const levels = await getLevelsAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Routine</h1>
      <CreateRoutineForm levels={levels} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getRoutineById } from "@/services/routines";
import { getLevels } from "@/services/levels";
import { EditRoutineForm } from "./edit-form";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [routine, levels] = await Promise.all([
    getRoutineById(parseInt(id)),
    getLevels(),
  ]);

  if (!routine) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Routine</h1>
      <EditRoutineForm routine={routine} levels={levels} />
    </div>
  );
}

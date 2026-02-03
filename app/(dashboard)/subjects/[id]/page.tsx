import { notFound } from "next/navigation";
import { getSubjectById } from "@/services/subjects";
import { getLevels } from "@/services/levels";
import { EditSubjectForm } from "./edit-form";

export default async function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [subject, levels] = await Promise.all([
    getSubjectById(parseInt(id)),
    getLevels(),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Subject</h1>
      <EditSubjectForm subject={subject} levels={levels} />
    </div>
  );
}

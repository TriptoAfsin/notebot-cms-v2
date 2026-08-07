import { notFound } from "next/navigation";
import { getSyllabusByIdAction } from "@/actions/syllabuses.action";
import { EditSyllabusForm } from "./edit-form";

export default async function EditSyllabusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const syllabus = await getSyllabusByIdAction(parseInt(id));

  if (!syllabus) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Syllabus Entry</h1>
      <EditSyllabusForm syllabus={syllabus} />
    </div>
  );
}

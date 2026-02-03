import { notFound } from "next/navigation";
import { getNoteById } from "@/services/notes";
import { getTopics } from "@/services/topics";
import { EditNoteForm } from "./edit-form";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [note, topics] = await Promise.all([
    getNoteById(parseInt(id)),
    getTopics(),
  ]);

  if (!note) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Note</h1>
      <EditNoteForm note={note} topics={topics} />
    </div>
  );
}

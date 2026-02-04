import { notFound } from "next/navigation";
import { getNoteByIdAction } from "@/actions/notes.action";
import { getTopicsAction } from "@/actions/topics.action";
import { EditNoteForm } from "./edit-form";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [note, topics] = await Promise.all([
    getNoteByIdAction(parseInt(id)),
    getTopicsAction(),
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

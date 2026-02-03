import { getTopics } from "@/services/topics";
import { CreateNoteForm } from "./create-form";

export default async function NewNotePage() {
  const topics = await getTopics();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Note</h1>
      <CreateNoteForm topics={topics} />
    </div>
  );
}

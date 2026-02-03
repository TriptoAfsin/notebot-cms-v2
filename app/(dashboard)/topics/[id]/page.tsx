import { notFound } from "next/navigation";
import { getTopicByIdAction } from "@/actions/topics";
import { getSubjectsAction } from "@/actions/subjects";
import { EditTopicForm } from "./edit-form";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [topic, subjects] = await Promise.all([
    getTopicByIdAction(parseInt(id)),
    getSubjectsAction(),
  ]);

  if (!topic) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Topic</h1>
      <EditTopicForm topic={topic} subjects={subjects} />
    </div>
  );
}

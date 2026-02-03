import { getSubjectsAction } from "@/actions/subjects";
import { NewTopicForm } from "./new-form";

export default async function NewTopicPage() {
  const subjects = await getSubjectsAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Topic</h1>
      <NewTopicForm subjects={subjects} />
    </div>
  );
}

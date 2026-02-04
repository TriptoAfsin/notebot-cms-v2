import { getNotesAction } from "@/actions/notes.action";
import { getTopicsAction } from "@/actions/topics.action";
import { NotesTable } from "./notes-table";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await searchParams;
  const parsedTopicId = topicId ? parseInt(topicId) : undefined;
  const [notes, topics] = await Promise.all([getNotesAction(parsedTopicId), getTopicsAction()]);

  return <NotesTable notes={notes} topics={topics} currentTopicId={parsedTopicId} />;
}

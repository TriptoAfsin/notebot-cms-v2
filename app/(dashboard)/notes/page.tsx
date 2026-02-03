import { getNotes } from "@/services/notes";
import { getTopics } from "@/services/topics";
import { NotesTable } from "./notes-table";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await searchParams;
  const parsedTopicId = topicId ? parseInt(topicId) : undefined;
  const [notes, topics] = await Promise.all([getNotes(parsedTopicId), getTopics()]);

  return <NotesTable notes={notes} topics={topics} currentTopicId={parsedTopicId} />;
}

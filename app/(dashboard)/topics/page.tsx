import { getTopics } from "@/services/topics";
import { getSubjects } from "@/services/subjects";
import { TopicsTable } from "./topics-table";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { subjectId } = await searchParams;
  const subjectIdNum = subjectId ? parseInt(subjectId) : undefined;

  const [topics, subjects] = await Promise.all([
    getTopics(subjectIdNum),
    getSubjects(),
  ]);

  return <TopicsTable topics={topics} subjects={subjects} currentSubjectId={subjectIdNum} />;
}

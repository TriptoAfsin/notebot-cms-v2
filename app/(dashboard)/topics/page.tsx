import { getTopicsAction } from "@/actions/topics.action";
import { getSubjectsAction } from "@/actions/subjects.action";
import { TopicsTable } from "./topics-table";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { subjectId } = await searchParams;
  const subjectIdNum = subjectId ? parseInt(subjectId) : undefined;

  const [topics, subjects] = await Promise.all([
    getTopicsAction(subjectIdNum),
    getSubjectsAction(),
  ]);

  return <TopicsTable topics={topics} subjects={subjects} currentSubjectId={subjectIdNum} />;
}

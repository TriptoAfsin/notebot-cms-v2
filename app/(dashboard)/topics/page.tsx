import Link from "next/link";
import { getTopics } from "@/services/topics";
import { getSubjects } from "@/services/subjects";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteTopicButton } from "./delete-button";
import { SubjectFilter } from "./subject-filter";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Link href="/topics/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by Subject:</span>
        <SubjectFilter subjects={subjects} currentSubjectId={subjectIdNum} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>{topic.id}</TableCell>
              <TableCell>{topic.subjectName}</TableCell>
              <TableCell>{topic.name}</TableCell>
              <TableCell>{topic.displayName}</TableCell>
              <TableCell>{topic.slug}</TableCell>
              <TableCell>{topic.sortOrder}</TableCell>
              <TableCell>{topic.metadata ? JSON.stringify(topic.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/topics/${topic.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteTopicButton id={topic.id} subjectId={topic.subjectId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {topics.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No topics found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import Link from "next/link";
import { getSubjects } from "@/services/subjects";
import { getLevels } from "@/services/levels";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteSubjectButton } from "./delete-button";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [subjects, levels] = await Promise.all([getSubjects(parsedLevelId), getLevels()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Link href="/subjects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by Level:</span>
        <div className="flex gap-2">
          <Link href="/subjects">
            <Button variant={!parsedLevelId ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {levels.map((level) => (
            <Link key={level.id} href={`/subjects?levelId=${level.id}`}>
              <Button
                variant={parsedLevelId === level.id ? "default" : "outline"}
                size="sm"
              >
                {level.displayName}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>{subject.id}</TableCell>
              <TableCell>{subject.levelName}</TableCell>
              <TableCell>{subject.name}</TableCell>
              <TableCell>{subject.displayName}</TableCell>
              <TableCell>{subject.slug}</TableCell>
              <TableCell>{subject.sortOrder}</TableCell>
              <TableCell>{subject.metadata ? JSON.stringify(subject.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/subjects/${subject.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteSubjectButton id={subject.id} levelId={subject.levelId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {subjects.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No subjects found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

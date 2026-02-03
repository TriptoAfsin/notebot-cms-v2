import Link from "next/link";
import { getQuestionBanks } from "@/services/questionBanks";
import { getLevels } from "@/services/levels";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteQuestionBankButton } from "./delete-button";

export default async function QuestionBanksPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [questionBanks, levels] = await Promise.all([getQuestionBanks(parsedLevelId), getLevels()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <Link href="/question-banks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Question Bank
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Link href="/question-banks">
          <Button variant={!parsedLevelId ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {levels.map((level) => (
          <Link key={level.id} href={`/question-banks?levelId=${level.id}`}>
            <Button variant={parsedLevelId === level.id ? "default" : "outline"} size="sm">
              {level.displayName}
            </Button>
          </Link>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Subject Slug</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questionBanks.map((qb) => (
            <TableRow key={qb.id}>
              <TableCell>{qb.id}</TableCell>
              <TableCell>{qb.levelName}</TableCell>
              <TableCell>{qb.subjectSlug}</TableCell>
              <TableCell>{qb.title}</TableCell>
              <TableCell title={qb.url}>
                {qb.url.length > 50 ? qb.url.slice(0, 50) + "..." : qb.url}
              </TableCell>
              <TableCell>{qb.sortOrder}</TableCell>
              <TableCell>{qb.metadata ? JSON.stringify(qb.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/question-banks/${qb.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteQuestionBankButton id={qb.id} levelId={qb.levelId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {questionBanks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No question banks found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { Link } from "next-view-transitions";
import { getQuestionBanks } from "@/services/question-banks";
import { getLevels } from "@/services/levels";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, ExternalLink } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <Link href="/question-banks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Question Bank
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
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

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionBanks.map((qb) => (
              <TableRow key={qb.id}>
                <TableCell className="font-mono text-xs">{qb.id}</TableCell>
                <TableCell className="text-sm">{qb.levelName}</TableCell>
                <TableCell>{qb.subjectSlug}</TableCell>
                <TableCell className="font-medium">{qb.title}</TableCell>
                <TableCell>
                  <a
                    href={qb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {qb.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/question-banks/${qb.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteQuestionBankButton id={qb.id} levelId={qb.levelId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {questionBanks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No question banks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

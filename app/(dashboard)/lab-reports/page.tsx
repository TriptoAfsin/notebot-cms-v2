import Link from "next/link";
import { getLabReports } from "@/services/lab-reports";
import { getLevels } from "@/services/levels";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteLabReportButton } from "./delete-button";

export default async function LabReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string }>;
}) {
  const { levelId } = await searchParams;
  const parsedLevelId = levelId ? parseInt(levelId) : undefined;
  const [labReports, levels] = await Promise.all([getLabReports(parsedLevelId), getLevels()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <Link href="/lab-reports/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lab Report
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Link href="/lab-reports">
          <Button variant={!parsedLevelId ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {levels.map((level) => (
          <Link key={level.id} href={`/lab-reports?levelId=${level.id}`}>
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
            <TableHead>Topic Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labReports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.levelName}</TableCell>
              <TableCell>{report.subjectSlug}</TableCell>
              <TableCell>{report.topicName}</TableCell>
              <TableCell>{report.title}</TableCell>
              <TableCell title={report.url}>
                {report.url.length > 50 ? report.url.slice(0, 50) + "..." : report.url}
              </TableCell>
              <TableCell>{report.sortOrder}</TableCell>
              <TableCell>{report.metadata ? JSON.stringify(report.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/lab-reports/${report.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteLabReportButton id={report.id} levelId={report.levelId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {labReports.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No lab reports found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

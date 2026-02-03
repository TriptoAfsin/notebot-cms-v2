import { Link } from "next-view-transitions";
import { getRoutines } from "@/services/routines";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteRoutineButton } from "./delete-button";

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Link href="/routines/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Routine
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routines.map((routine) => (
              <TableRow key={routine.id}>
                <TableCell className="font-mono text-xs">{routine.id}</TableCell>
                <TableCell className="text-sm">{routine.levelName}</TableCell>
                <TableCell>{routine.term || "-"}</TableCell>
                <TableCell>{routine.department || "-"}</TableCell>
                <TableCell className="font-medium">{routine.title}</TableCell>
                <TableCell>
                  <a
                    href={routine.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {routine.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/routines/${routine.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteRoutineButton id={routine.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {routines.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No routines found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

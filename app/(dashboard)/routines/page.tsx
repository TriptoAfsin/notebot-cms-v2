import Link from "next/link";
import { getRoutines } from "@/services/routines";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteRoutineButton } from "./delete-button";

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Link href="/routines/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Routine
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routines.map((routine) => (
            <TableRow key={routine.id}>
              <TableCell>{routine.id}</TableCell>
              <TableCell>{routine.levelName}</TableCell>
              <TableCell>{routine.term || "-"}</TableCell>
              <TableCell>{routine.department || "-"}</TableCell>
              <TableCell>{routine.title}</TableCell>
              <TableCell title={routine.url}>
                {routine.url.length > 50 ? routine.url.slice(0, 50) + "..." : routine.url}
              </TableCell>
              <TableCell>{routine.sortOrder}</TableCell>
              <TableCell>{routine.metadata ? JSON.stringify(routine.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/routines/${routine.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteRoutineButton id={routine.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {routines.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No routines found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

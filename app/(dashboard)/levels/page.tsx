import Link from "next/link";
import { getLevels } from "@/services/levels";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteLevelButton } from "./delete-button";

export default async function LevelsPage() {
  const levels = await getLevels();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Levels</h1>
        <Link href="/levels/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.id}>
              <TableCell>{level.id}</TableCell>
              <TableCell>{level.name}</TableCell>
              <TableCell>{level.displayName}</TableCell>
              <TableCell>{level.slug}</TableCell>
              <TableCell>{level.sortOrder}</TableCell>
              <TableCell>{level.metadata ? JSON.stringify(level.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/levels/${level.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteLevelButton id={level.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {levels.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No levels found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

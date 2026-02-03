import { Link } from "next-view-transitions";
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

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-mono text-xs">{level.id}</TableCell>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>{level.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{level.slug}</TableCell>
                <TableCell>{level.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/levels/${level.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteLevelButton id={level.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {levels.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No levels found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

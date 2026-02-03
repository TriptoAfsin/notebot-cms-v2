import Link from "next/link";
import { getResults } from "@/services/results";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteResultButton } from "./delete-button";

export default async function ResultsPage() {
  const results = await getResults();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <Link href="/results/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell>{result.id}</TableCell>
              <TableCell>{result.title}</TableCell>
              <TableCell title={result.url}>
                {result.url.length > 50 ? result.url.slice(0, 50) + "..." : result.url}
              </TableCell>
              <TableCell>{result.category || "-"}</TableCell>
              <TableCell>{result.sortOrder}</TableCell>
              <TableCell>{result.metadata ? JSON.stringify(result.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/results/${result.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteResultButton id={result.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {results.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No results found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

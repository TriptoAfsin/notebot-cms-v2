import { Link } from "next-view-transitions";
import { getResults } from "@/services/results";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteResultButton } from "./delete-button";

export default async function ResultsPage() {
  const results = await getResults();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <Link href="/results/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-mono text-xs">{result.id}</TableCell>
                <TableCell className="font-medium">{result.title}</TableCell>
                <TableCell>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {result.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>{result.category || "-"}</TableCell>
                <TableCell>{result.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/results/${result.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteResultButton id={result.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

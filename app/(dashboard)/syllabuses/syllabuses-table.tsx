"use client";

import { useState, useMemo } from "react";
import { Link } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteSyllabusButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { updateSyllabusAction } from "@/actions/syllabuses.action";
import { toast } from "sonner";

const editSchema = z.object({
  batch: z.string().min(1, "Batch is required").max(20),
  department: z
    .string()
    .min(1, "Department slug is required")
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Lowercase letters, numbers, - and _ only"),
  departmentName: z.string().min(1, "Department label is required").max(100),
  departmentSort: z.coerce.number().int().default(0),
  topic: z.string().min(1, "Topic is required").max(200),
  url: z.string().url("Must be a valid URL").max(1000),
  metadata: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type EditFormValues = z.infer<typeof editSchema>;

type Syllabus = {
  id: number;
  batch: string;
  department: string;
  departmentName: string;
  departmentSort: number;
  topic: string;
  url: string;
  sortOrder: number;
  metadata: unknown;
};

export function SyllabusesTable({
  syllabuses,
  batches,
  currentBatch,
}: {
  syllabuses: Syllabus[];
  batches: string[];
  currentBatch?: string;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Syllabus | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return syllabuses;
    const q = debouncedSearch.toLowerCase();
    return syllabuses.filter(
      (s) =>
        s.topic.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.departmentName.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
    );
  }, [syllabuses, debouncedSearch]);

  // jump back to the first page when the query changes — adjusted during render rather than in
  // an effect, which would cause a cascading re-render (react-hooks/set-state-in-effect)
  const [lastSearch, setLastSearch] = useState(debouncedSearch);
  if (lastSearch !== debouncedSearch) {
    setLastSearch(debouncedSearch);
    setPage(1);
  }

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (s: Syllabus) => {
    form.reset({
      batch: s.batch,
      department: s.department,
      departmentName: s.departmentName,
      departmentSort: s.departmentSort,
      topic: s.topic,
      url: s.url,
      sortOrder: s.sortOrder,
      metadata: s.metadata ? JSON.stringify(s.metadata, null, 2) : "",
    });
    setEditing(s);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!editing) return;
    const formData = new FormData();
    formData.set("batch", data.batch);
    formData.set("department", data.department);
    formData.set("departmentName", data.departmentName);
    formData.set("departmentSort", String(data.departmentSort));
    formData.set("topic", data.topic);
    formData.set("url", data.url);
    formData.set("sortOrder", String(data.sortOrder));
    if (data.metadata) {
      formData.set("metadata", data.metadata);
    }
    const result = await updateSyllabusAction(editing.id, formData);
    if (result.success) {
      toast.success("Syllabus entry updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update syllabus entry");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Syllabuses</h1>
        <Link href="/syllabuses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Syllabus Entry
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          pending={search !== debouncedSearch}
          placeholder="Search syllabuses..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/syllabuses">
            <Button variant={!currentBatch ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {batches.map((batch) => (
            <Link key={batch} href={`/syllabuses?batch=${batch}`}>
              <Button variant={currentBatch === batch ? "default" : "outline"} size="sm">
                Batch {batch}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-20">Batch</TableHead>
              <TableHead className="w-32">Department</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell className="text-sm">{s.batch}</TableCell>
                <TableCell className="text-sm">
                  {s.departmentName}
                  <span className="text-muted-foreground ml-1.5 font-mono text-xs">{s.department}</span>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" title={s.topic}>{s.topic}</TableCell>
                <TableCell>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {s.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteSyllabusButton id={s.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No syllabuses match your search" : "No syllabuses found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        totalItems={filtered.length}
      />

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Syllabus Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="edit-batch">Batch</Label>
              <Input id="edit-batch" {...form.register("batch")} />
              {form.formState.errors.batch && (
                <p className="text-xs text-destructive">{form.formState.errors.batch.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department Slug</Label>
              <Input id="edit-department" {...form.register("department")} />
              {form.formState.errors.department && (
                <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-departmentName">Department Label</Label>
              <Input id="edit-departmentName" {...form.register("departmentName")} />
              <p className="text-xs text-muted-foreground">
                Applies to every entry in this batch + department.
              </p>
              {form.formState.errors.departmentName && (
                <p className="text-xs text-destructive">{form.formState.errors.departmentName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-departmentSort">Department Order</Label>
              <Input id="edit-departmentSort" type="number" {...form.register("departmentSort")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-topic">Topic</Label>
              <Input id="edit-topic" {...form.register("topic")} />
              {form.formState.errors.topic && (
                <p className="text-xs text-destructive">{form.formState.errors.topic.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input id="edit-url" {...form.register("url")} />
              {form.formState.errors.url && (
                <p className="text-xs text-destructive">{form.formState.errors.url.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
              <Textarea
                id="edit-metadata"
                rows={4}
                placeholder='{"key": "value"}'
                {...form.register("metadata")}
              />
              {form.formState.errors.metadata && (
                <p className="text-xs text-destructive">{form.formState.errors.metadata.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input id="edit-sortOrder" type="number" {...form.register("sortOrder")} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

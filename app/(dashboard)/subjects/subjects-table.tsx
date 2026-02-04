"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Plus, Pencil } from "lucide-react";
import { DeleteSubjectButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { updateSubjectAction } from "@/actions/subjects.action";
import { toast } from "sonner";

const editSchema = z.object({
  levelId: z.coerce.number().int("Level is required"),
  name: z.string().min(1, "Name is required").max(50),
  displayName: z.string().min(1, "Display name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50),
  sortOrder: z.coerce.number().int().default(0),
  metadata: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

type Subject = {
  id: number;
  levelId: number;
  levelName: string;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type Level = {
  id: number;
  displayName: string;
};

export function SubjectsTable({
  subjects,
  levels,
  currentLevelId,
}: {
  subjects: Subject[];
  levels: Level[];
  currentLevelId?: number;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Subject | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return subjects;
    const q = debouncedSearch.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.levelName.toLowerCase().includes(q)
    );
  }, [subjects, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (subject: Subject) => {
    form.reset({
      levelId: subject.levelId,
      name: subject.name,
      displayName: subject.displayName,
      slug: subject.slug,
      sortOrder: subject.sortOrder,
      metadata: subject.metadata ? JSON.stringify(subject.metadata, null, 2) : "",
    });
    setEditing(subject);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!editing) return;
    const formData = new FormData();
    formData.set("levelId", String(data.levelId));
    formData.set("name", data.name);
    formData.set("displayName", data.displayName);
    formData.set("slug", data.slug);
    formData.set("sortOrder", String(data.sortOrder));
    if (data.metadata) {
      formData.set("metadata", data.metadata);
    }
    const result = await updateSubjectAction(editing.id, formData);
    if (result.success) {
      toast.success("Subject updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update subject");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Link href="/subjects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subjects..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentLevelId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/subjects?levelId=${val}` : "/subjects");
          }}
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-28">Level</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead className="w-32">Slug</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-28">Updated</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-mono text-xs">{subject.id}</TableCell>
                <TableCell className="text-sm">{subject.levelName}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{subject.slug}</TableCell>
                <TableCell>{subject.sortOrder}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(subject.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(subject.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" onClick={() => openEdit(subject)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteSubjectButton id={subject.id} levelId={subject.levelId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  {search ? "No subjects match your search" : "No subjects found"}
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
            <SheetTitle>Edit Subject</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="edit-levelId">Level</Label>
              <select
                id="edit-levelId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                {...form.register("levelId")}
              >
                <option value="">Select a level</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayName}
                  </option>
                ))}
              </select>
              {form.formState.errors.levelId && (
                <p className="text-xs text-destructive">{form.formState.errors.levelId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input id="edit-displayName" {...form.register("displayName")} />
              {form.formState.errors.displayName && (
                <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input id="edit-sortOrder" type="number" {...form.register("sortOrder")} />
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

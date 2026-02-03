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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Pencil } from "lucide-react";
import { DeleteTopicButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchableSelect } from "@/components/searchable-select";
import { updateTopicAction } from "@/actions/topics";
import { toast } from "sonner";

type Topic = {
  id: number;
  subjectId: number;
  subjectName: string;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type Subject = {
  id: number;
  displayName: string;
};

const editSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  name: z.string().min(1, "Name is required").max(100),
  displayName: z.string().min(1, "Display name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(100),
  author: z.string().optional(),
  year: z.string().optional(),
  department: z.string().optional(),
  sortOrder: z.coerce.number(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function TopicsTable({
  topics,
  subjects,
  currentSubjectId,
}: {
  topics: Topic[];
  subjects: Subject[];
  currentSubjectId?: number;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Topic | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      subjectId: "",
      name: "",
      displayName: "",
      slug: "",
      author: "",
      year: "",
      department: "",
      sortOrder: 0,
    },
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return topics;
    const q = debouncedSearch.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.displayName.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.subjectName.toLowerCase().includes(q)
    );
  }, [topics, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const subjectOptions = subjects.map((s) => ({
    value: String(s.id),
    label: s.displayName,
  }));

  function openEdit(topic: Topic) {
    const meta = (topic.metadata ?? {}) as Record<string, unknown>;
    form.reset({
      subjectId: String(topic.subjectId),
      name: topic.name,
      displayName: topic.displayName,
      slug: topic.slug,
      author: (meta.author as string) ?? "",
      year: meta.year != null ? String(meta.year) : "",
      department: (meta.department as string) ?? "",
      sortOrder: topic.sortOrder,
    });
    setEditing(topic);
  }

  async function onSubmit(values: EditFormValues) {
    if (!editing) return;

    const formData = new FormData();
    formData.set("subjectId", values.subjectId);
    formData.set("name", values.name);
    formData.set("displayName", values.displayName);
    formData.set("slug", values.slug);
    formData.set("sortOrder", String(values.sortOrder));

    const metadata: Record<string, string | number> = {};
    if (values.author) metadata.author = values.author;
    if (values.year) metadata.year = parseInt(values.year);
    if (values.department) metadata.department = values.department;
    if (Object.keys(metadata).length > 0) {
      formData.set("metadata", JSON.stringify(metadata));
    }

    const result = await updateTopicAction(editing.id, formData);
    if (result.success) {
      toast.success("Topic updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update topic");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Link href="/topics/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search topics..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentSubjectId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/topics?subjectId=${val}` : "/topics");
          }}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-32">Subject</TableHead>
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
            {paginated.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-mono text-xs">{topic.id}</TableCell>
                <TableCell className="text-sm">{topic.subjectName}</TableCell>
                <TableCell className="font-medium">{topic.name}</TableCell>
                <TableCell>{topic.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{topic.slug}</TableCell>
                <TableCell>{topic.sortOrder}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(topic.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(topic.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => openEdit(topic)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteTopicButton id={topic.id} subjectId={topic.subjectId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  {search ? "No topics match your search" : "No topics found"}
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
            <SheetTitle>Edit Topic</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="edit-subjectId">Subject</Label>
              <SearchableSelect
                options={subjectOptions}
                value={form.watch("subjectId")}
                onValueChange={(val) => form.setValue("subjectId", val, { shouldValidate: true })}
                placeholder="Select a subject"
                searchPlaceholder="Search subjects..."
              />
              {form.formState.errors.subjectId && (
                <p className="text-sm text-destructive">{form.formState.errors.subjectId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" {...form.register("name")} placeholder="Topic name" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input id="edit-displayName" {...form.register("displayName")} placeholder="Display name" />
              {form.formState.errors.displayName && (
                <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" {...form.register("slug")} placeholder="topic-slug" />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author</Label>
                <Input id="edit-author" {...form.register("author")} placeholder="Author name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input id="edit-year" {...form.register("year")} type="number" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input id="edit-department" {...form.register("department")} placeholder="CSE, EEE, etc." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input id="edit-sortOrder" {...form.register("sortOrder")} type="number" />
              {form.formState.errors.sortOrder && (
                <p className="text-sm text-destructive">{form.formState.errors.sortOrder.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
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

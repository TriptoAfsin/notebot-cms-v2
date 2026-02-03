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
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteNoteButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { SearchableSelect } from "@/components/searchable-select";
import { updateNoteAction } from "@/actions/notes";
import { toast } from "sonner";

type Note = {
  id: number;
  topicId: number;
  topicName: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata: unknown;
};

type Topic = {
  id: number;
  displayName: string;
  subjectName: string | null;
};

const editSchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  title: z.string().min(1, "Title is required").max(500),
  url: z.string().url("Must be a valid URL").max(1000),
  author: z.string().optional(),
  year: z.string().optional(),
  department: z.string().optional(),
  sortOrder: z.coerce.number(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function NotesTable({
  notes,
  topics,
  currentTopicId,
}: {
  notes: Note[];
  topics: Topic[];
  currentTopicId?: number;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      topicId: "",
      title: "",
      url: "",
      author: "",
      year: "",
      department: "",
      sortOrder: 0,
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.topicName.toLowerCase().includes(q) ||
        n.url.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const topicOptions = topics.map((t) => ({
    value: String(t.id),
    label: t.subjectName ? `${t.subjectName} → ${t.displayName}` : t.displayName,
  }));

  function openEdit(note: Note) {
    const meta = (note.metadata ?? {}) as Record<string, unknown>;
    form.reset({
      topicId: String(note.topicId),
      title: note.title,
      url: note.url,
      author: (meta.author as string) ?? "",
      year: meta.year != null ? String(meta.year) : "",
      department: (meta.department as string) ?? "",
      sortOrder: note.sortOrder,
    });
    setEditing(note);
  }

  async function onSubmit(values: EditFormValues) {
    if (!editing) return;

    const formData = new FormData();
    formData.set("topicId", values.topicId);
    formData.set("title", values.title);
    formData.set("url", values.url);
    formData.set("sortOrder", String(values.sortOrder));

    const metadata: Record<string, string | number> = {};
    if (values.author) metadata.author = values.author;
    if (values.year) metadata.year = parseInt(values.year);
    if (values.department) metadata.department = values.department;
    if (Object.keys(metadata).length > 0) {
      formData.set("metadata", JSON.stringify(metadata));
    }

    const result = await updateNoteAction(editing.id, formData);
    if (result.success) {
      toast.success("Note updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update note");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link href="/notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search notes..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentTopicId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/notes?topicId=${val}` : "/notes");
          }}
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-36">Topic</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-64">URL</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-mono text-xs">{note.id}</TableCell>
                <TableCell className="text-sm">{note.topicName}</TableCell>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell>
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[240px]"
                  >
                    {note.url.replace(/^https?:\/\//, "").slice(0, 40)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>{note.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => openEdit(note)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteNoteButton id={note.id} topicId={note.topicId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No notes match your search" : "No notes found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} of {notes.length} notes
      </p>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Note</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="edit-topicId">Topic</Label>
              <SearchableSelect
                options={topicOptions}
                value={form.watch("topicId")}
                onValueChange={(val) => form.setValue("topicId", val, { shouldValidate: true })}
                placeholder="Select a topic"
                searchPlaceholder="Search topics..."
              />
              {form.formState.errors.topicId && (
                <p className="text-sm text-destructive">{form.formState.errors.topicId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" {...form.register("title")} placeholder="Note title" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input id="edit-url" {...form.register("url")} type="url" placeholder="https://example.com/note" />
              {form.formState.errors.url && (
                <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
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

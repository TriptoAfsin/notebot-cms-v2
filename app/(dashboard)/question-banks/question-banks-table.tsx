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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteQuestionBankButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { updateQuestionBankAction } from "@/actions/question-banks";
import { toast } from "sonner";

const editSchema = z.object({
  levelId: z.coerce.number().int("Level is required"),
  subjectSlug: z.string().min(1, "Subject slug is required").max(50),
  title: z.string().min(1, "Title is required").max(500),
  url: z.string().url("Must be a valid URL").max(1000),
  metadata: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type EditFormValues = z.infer<typeof editSchema>;

type QuestionBank = {
  id: number;
  levelId: number;
  levelName: string;
  subjectSlug: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata: unknown;
};

type Level = {
  id: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
};

export function QuestionBanksTable({
  questionBanks,
  levels,
  currentLevelId,
}: {
  questionBanks: QuestionBank[];
  levels: Level[];
  currentLevelId?: number;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<QuestionBank | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return questionBanks;
    const q = debouncedSearch.toLowerCase();
    return questionBanks.filter(
      (qb) =>
        qb.title.toLowerCase().includes(q) ||
        qb.subjectSlug.toLowerCase().includes(q) ||
        qb.levelName.toLowerCase().includes(q)
    );
  }, [questionBanks, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (qb: QuestionBank) => {
    form.reset({
      levelId: qb.levelId,
      subjectSlug: qb.subjectSlug,
      title: qb.title,
      url: qb.url,
      sortOrder: qb.sortOrder,
      metadata: qb.metadata ? JSON.stringify(qb.metadata, null, 2) : "",
    });
    setEditing(qb);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!editing) return;
    const formData = new FormData();
    formData.set("levelId", String(data.levelId));
    formData.set("subjectSlug", data.subjectSlug);
    formData.set("title", data.title);
    formData.set("url", data.url);
    formData.set("sortOrder", String(data.sortOrder));
    if (data.metadata) {
      formData.set("metadata", data.metadata);
    }
    const result = await updateQuestionBankAction(editing.id, formData);
    if (result.success) {
      toast.success("Question bank updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update question bank");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <Link href="/question-banks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Question Bank
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search question banks..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/question-banks">
            <Button variant={!currentLevelId ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {levels.map((level) => (
            <Link key={level.id} href={`/question-banks?levelId=${level.id}`}>
              <Button variant={currentLevelId === level.id ? "default" : "outline"} size="sm">
                {level.displayName}
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
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((qb) => (
              <TableRow key={qb.id}>
                <TableCell className="font-mono text-xs">{qb.id}</TableCell>
                <TableCell className="text-sm">{qb.levelName}</TableCell>
                <TableCell>{qb.subjectSlug}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" title={qb.title}>{qb.title}</TableCell>
                <TableCell>
                  <a
                    href={qb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {qb.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" onClick={() => openEdit(qb)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteQuestionBankButton id={qb.id} levelId={qb.levelId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No question banks match your search" : "No question banks found"}
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
            <SheetTitle>Edit Question Bank</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="edit-levelId">Level</Label>
              <Select
                value={form.watch("levelId") ? String(form.watch("levelId")) : ""}
                onValueChange={(value) => form.setValue("levelId", parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={String(level.id)}>
                      {level.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.levelId && (
                <p className="text-xs text-destructive">{form.formState.errors.levelId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subjectSlug">Subject Slug</Label>
              <Input id="edit-subjectSlug" {...form.register("subjectSlug")} />
              {form.formState.errors.subjectSlug && (
                <p className="text-xs text-destructive">{form.formState.errors.subjectSlug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
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

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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteRoutineButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { updateRoutineAction } from "@/actions/routines";
import { toast } from "sonner";

const editSchema = z.object({
  levelId: z.coerce.number().int("Level is required"),
  term: z.string().optional(),
  department: z.string().optional(),
  title: z.string().min(1, "Title is required").max(500),
  url: z.string().url("Must be a valid URL").max(1000),
  metadata: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type EditFormValues = z.infer<typeof editSchema>;

type Routine = {
  id: number;
  levelId: number;
  levelName: string;
  term: string | null;
  department: string | null;
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

export function RoutinesTable({
  routines,
  levels,
}: {
  routines: Routine[];
  levels: Level[];
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Routine | null>(null);
  const router = useRouter();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return routines;
    const q = search.toLowerCase();
    return routines.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.levelName.toLowerCase().includes(q) ||
        (r.term && r.term.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q))
    );
  }, [routines, search]);

  const openEdit = (routine: Routine) => {
    form.reset({
      levelId: routine.levelId,
      term: routine.term || "",
      department: routine.department || "",
      title: routine.title,
      url: routine.url,
      sortOrder: routine.sortOrder,
      metadata: routine.metadata ? JSON.stringify(routine.metadata, null, 2) : "",
    });
    setEditing(routine);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!editing) return;
    const formData = new FormData();
    formData.set("levelId", String(data.levelId));
    if (data.term) {
      formData.set("term", data.term);
    }
    if (data.department) {
      formData.set("department", data.department);
    }
    formData.set("title", data.title);
    formData.set("url", data.url);
    formData.set("sortOrder", String(data.sortOrder));
    if (data.metadata) {
      formData.set("metadata", data.metadata);
    }
    const result = await updateRoutineAction(editing.id, formData);
    if (result.success) {
      toast.success("Routine updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update routine");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Link href="/routines/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Routine
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search routines..."
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-48">URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((routine) => (
              <TableRow key={routine.id}>
                <TableCell className="font-mono text-xs">{routine.id}</TableCell>
                <TableCell className="text-sm">{routine.levelName}</TableCell>
                <TableCell>{routine.term || "-"}</TableCell>
                <TableCell>{routine.department || "-"}</TableCell>
                <TableCell className="font-medium">{routine.title}</TableCell>
                <TableCell>
                  <a
                    href={routine.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[180px]"
                  >
                    {routine.url.replace(/^https?:\/\//, "").slice(0, 30)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" onClick={() => openEdit(routine)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteRoutineButton id={routine.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {search ? "No routines match your search" : "No routines found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} of {routines.length} routines
      </p>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Routine</SheetTitle>
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
              <Label htmlFor="edit-term">Term (optional)</Label>
              <Input id="edit-term" {...form.register("term")} />
              {form.formState.errors.term && (
                <p className="text-xs text-destructive">{form.formState.errors.term.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department (optional)</Label>
              <Input id="edit-department" {...form.register("department")} />
              {form.formState.errors.department && (
                <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
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

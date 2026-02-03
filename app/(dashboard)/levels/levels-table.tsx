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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Pencil } from "lucide-react";
import { DeleteLevelButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { updateLevelAction } from "@/actions/levels";
import { toast } from "sonner";

const editSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  displayName: z.string().min(1, "Display name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50),
  sortOrder: z.coerce.number().int().default(0),
});

type EditFormValues = z.infer<typeof editSchema>;

type Level = {
  id: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: unknown;
};

export function LevelsTable({ levels }: { levels: Level[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Level | null>(null);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return levels;
    const q = debouncedSearch.toLowerCase();
    return levels.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.displayName.toLowerCase().includes(q) ||
        l.slug.toLowerCase().includes(q)
    );
  }, [levels, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (level: Level) => {
    form.reset({
      name: level.name,
      displayName: level.displayName,
      slug: level.slug,
      sortOrder: level.sortOrder,
    });
    setEditing(level);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!editing) return;
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("displayName", data.displayName);
    formData.set("slug", data.slug);
    formData.set("sortOrder", String(data.sortOrder));
    const result = await updateLevelAction(editing.id, formData);
    if (result.success) {
      toast.success("Level updated");
      setEditing(null);
      router.refresh();
    } else {
      toast.error("Failed to update level");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Levels</h1>
        <Link href="/levels/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search levels..."
        />
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
            {paginated.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-mono text-xs">{level.id}</TableCell>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>{level.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{level.slug}</TableCell>
                <TableCell>{level.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon-xs" onClick={() => openEdit(level)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteLevelButton id={level.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No levels match your search" : "No levels found"}
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
            <SheetTitle>Edit Level</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
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

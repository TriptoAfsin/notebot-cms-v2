"use client";

import { useRouter } from "next/navigation";
import { updateRoutineAction } from "@/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Routine = {
  id: number;
  levelId: number;
  term: string | null;
  department: string | null;
  title: string;
  url: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
};

type Level = {
  id: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
};

export function EditRoutineForm({ routine, levels }: { routine: Routine; levels: Level[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateRoutineAction(routine.id, formData);
    if (result.success) {
      toast.success("Routine updated");
      router.push("/routines");
    } else {
      toast.error("Failed to update routine");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="levelId">Level</Label>
            <Select name="levelId" defaultValue={String(routine.levelId)} required>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Term (optional)</Label>
            <Input id="term" name="term" defaultValue={routine.term || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department (optional)</Label>
            <Input id="department" name="department" defaultValue={routine.department || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={routine.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={routine.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={routine.metadata ? JSON.stringify(routine.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={routine.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/routines")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

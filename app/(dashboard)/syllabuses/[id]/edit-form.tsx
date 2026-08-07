"use client";

import { useRouter } from "next/navigation";
import { updateSyllabusAction } from "@/actions/syllabuses.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Syllabus = {
  id: number;
  batch: string;
  department: string;
  departmentName: string;
  departmentSort: number;
  topic: string;
  url: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
};

export function EditSyllabusForm({ syllabus }: { syllabus: Syllabus }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateSyllabusAction(syllabus.id, formData);
    if (result.success) {
      toast.success("Syllabus entry updated");
      router.push("/syllabuses");
    } else {
      toast.error("Failed to update syllabus entry");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syllabus Entry Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Input id="batch" name="batch" defaultValue={syllabus.batch} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department Slug</Label>
            <Input id="department" name="department" defaultValue={syllabus.department} required />
            <p className="text-xs text-muted-foreground">
              Used in the URL: <code>/app/syllabus/{syllabus.batch}/{syllabus.department}</code>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="departmentName">Department Label</Label>
            <Input id="departmentName" name="departmentName" defaultValue={syllabus.departmentName} required />
            <p className="text-xs text-muted-foreground">
              Shown in the department list. Saving applies it to every entry in this department.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="departmentSort">Department Order</Label>
            <Input id="departmentSort" name="departmentSort" type="number" defaultValue={syllabus.departmentSort} />
            <p className="text-xs text-muted-foreground">
              Position of the department in the list (curriculum order, not alphabetical).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" name="topic" defaultValue={syllabus.topic} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={syllabus.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={syllabus.metadata ? JSON.stringify(syllabus.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={syllabus.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/syllabuses")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

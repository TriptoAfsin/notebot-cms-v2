"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSyllabusAction } from "@/actions/syllabuses.action";
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
};

export function CreateSyllabusForm({ existing }: { existing: Syllabus[] }) {
  const router = useRouter();
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");

  // one entry per batch+department, so picking an existing one can prefill its label and order
  const departments = useMemo(() => {
    const map = new Map<string, Syllabus>();
    for (const s of existing) {
      const key = `${s.batch}/${s.department}`;
      if (!map.has(key)) map.set(key, s);
    }
    return [...map.values()];
  }, [existing]);

  const match = departments.find((d) => d.batch === batch && d.department === department.toLowerCase());

  const handleSubmit = async (formData: FormData) => {
    const result = await createSyllabusAction(formData);
    if (result.success) {
      toast.success("Syllabus entry created");
      router.push("/syllabuses");
    } else {
      toast.error("Failed to create syllabus entry");
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
            <Input
              id="batch"
              name="batch"
              placeholder="45"
              list="syllabus-batches"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              required
            />
            <datalist id="syllabus-batches">
              {[...new Set(departments.map((d) => d.batch))].map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department Slug</Label>
            <Input
              id="department"
              name="department"
              placeholder="ae"
              list="syllabus-departments"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
            <datalist id="syllabus-departments">
              {departments
                .filter((d) => !batch || d.batch === batch)
                .map((d) => (
                  <option key={`${d.batch}/${d.department}`} value={d.department} />
                ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Used in the URL: <code>/app/syllabus/{batch || "45"}/{department.toLowerCase() || "ae"}</code>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="departmentName">Department Label</Label>
            <Input
              id="departmentName"
              name="departmentName"
              placeholder="AE"
              defaultValue={match?.departmentName ?? ""}
              key={`name-${match?.id ?? "new"}`}
              required
            />
            <p className="text-xs text-muted-foreground">
              Shown in the department list. Saving applies it to every entry in this department.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="departmentSort">Department Order</Label>
            <Input
              id="departmentSort"
              name="departmentSort"
              type="number"
              defaultValue={match?.departmentSort ?? 0}
              key={`sort-${match?.id ?? "new"}`}
            />
            <p className="text-xs text-muted-foreground">
              Position of the department in the list (curriculum order, not alphabetical).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" name="topic" placeholder="L 1,1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://drive.google.com/file/d/.../view" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea id="metadata" name="metadata" placeholder='{"note": "updated 2026"}' rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/syllabuses")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

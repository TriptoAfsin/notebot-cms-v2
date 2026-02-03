"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTopicAction } from "@/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/searchable-select";
import { toast } from "sonner";

type Topic = {
  id: number;
  subjectId: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
};

type Subject = {
  id: number;
  displayName: string;
};

export function EditTopicForm({ topic, subjects }: { topic: Topic; subjects: Subject[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(topic.subjectId.toString());

  const subjectOptions = subjects.map((s) => ({
    value: String(s.id),
    label: s.displayName,
  }));

  const handleSubmit = async (formData: FormData) => {
    formData.set("subjectId", subjectId);

    // Build metadata JSON from individual fields
    const metadata: Record<string, string | number> = {};
    const author = formData.get("author") as string;
    const year = formData.get("year") as string;
    const department = formData.get("department") as string;
    if (author) metadata.author = author;
    if (year) metadata.year = parseInt(year);
    if (department) metadata.department = department;

    formData.delete("author");
    formData.delete("year");
    formData.delete("department");
    if (Object.keys(metadata).length > 0) {
      formData.set("metadata", JSON.stringify(metadata));
    }

    const result = await updateTopicAction(topic.id, formData);
    if (result.success) {
      toast.success("Topic updated");
      router.push("/topics");
    } else {
      toast.error("Failed to update topic");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectId">Subject</Label>
            <SearchableSelect
              options={subjectOptions}
              value={subjectId}
              onValueChange={setSubjectId}
              placeholder="Select a subject"
              searchPlaceholder="Search subjects..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={topic.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" defaultValue={topic.displayName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={topic.slug} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                placeholder="Author name"
                defaultValue={(topic.metadata?.author as string) || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="2024"
                defaultValue={(topic.metadata?.year as number) || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                placeholder="CSE, EEE, etc."
                defaultValue={(topic.metadata?.department as string) || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={topic.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/topics")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNoteAction } from "@/actions/notes.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/searchable-select";
import { toast } from "sonner";

type Topic = {
  id: number;
  displayName: string;
  subjectName: string | null;
};

export function CreateNoteForm({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [topicId, setTopicId] = useState("");

  const topicOptions = topics.map((t) => ({
    value: String(t.id),
    label: t.subjectName ? `${t.subjectName} → ${t.displayName}` : t.displayName,
  }));

  const handleSubmit = async (formData: FormData) => {
    formData.set("topicId", topicId);

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

    const result = await createNoteAction(formData);
    if (result.success) {
      toast.success("Note created");
      router.push("/notes");
    } else {
      toast.error("Failed to create note");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicId">Topic</Label>
            <SearchableSelect
              options={topicOptions}
              value={topicId}
              onValueChange={setTopicId}
              placeholder="Select a topic"
              searchPlaceholder="Search topics..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Note title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://example.com/note" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" placeholder="Author name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" placeholder="2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="CSE, EEE, etc." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/notes")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

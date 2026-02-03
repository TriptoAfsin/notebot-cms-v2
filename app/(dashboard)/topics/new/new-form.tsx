"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTopicAction } from "@/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/searchable-select";
import { toast } from "sonner";

type Subject = {
  id: number;
  displayName: string;
};

export function NewTopicForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");

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

    const result = await createTopicAction(formData);
    if (result.success) {
      toast.success("Topic created");
      router.push("/topics");
    } else {
      toast.error("Failed to create topic");
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
            <Input id="name" name="name" placeholder="topic_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" placeholder="Topic Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="topic-name" required />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/topics")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

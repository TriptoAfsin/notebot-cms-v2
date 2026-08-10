"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTopicAction } from "@/actions/topics.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/searchable-select";
import { LivePreview } from "@/components/live-preview";
import { toSlug } from "@/lib/slug";
import { toast } from "sonner";

type Subject = {
  id: number;
  displayName: string;
};

export function NewTopicForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");
  // controlled so the preview can follow keystrokes
  const [displayName, setDisplayName] = useState("");
  // derived, never typed
  const slug = toSlug(displayName, 100);

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
            <Input id="name" value={slug || "—"} readOnly disabled tabIndex={-1} className="font-mono text-xs" />
            <input type="hidden" name="name" value={slug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" placeholder="Topic Name" required
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            {/* Generated from the display name. The slug is part of the URL the engine resolves,
                and hand-typing it is how the tree ended up with both "IAE" and "iae". */}
            <Input id="slug" value={slug || "—"} readOnly disabled tabIndex={-1}
              aria-describedby="slug-hint" className="font-mono text-xs" />
            <p id="slug-hint" className="text-xs text-muted-foreground">
              Generated from the display name; a clash is resolved automatically.
            </p>
            <input type="hidden" name="slug" value={slug} />
          </div>

          {/* A topic is a button on the subject page, so its display name is subject to the same
              20-character cut as any other Messenger button title. */}
          <div className="rounded-lg border bg-muted/20 p-3">
            <LivePreview kind="topic" subjectId={subjectId} displayName={displayName} slug={slug} />
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

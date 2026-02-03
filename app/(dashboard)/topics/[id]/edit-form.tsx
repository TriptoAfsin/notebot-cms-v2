"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTopicAction } from "@/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const handleSubmit = async (formData: FormData) => {
    formData.set("subjectId", subjectId);
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
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={topic.metadata ? JSON.stringify(topic.metadata, null, 2) : ""}
              rows={3}
            />
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

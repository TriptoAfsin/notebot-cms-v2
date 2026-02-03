"use client";

import { useRouter } from "next/navigation";
import { updateNoteAction } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Note = {
  id: number;
  topicId: number;
  title: string;
  url: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
};

type Topic = {
  id: number;
  displayName: string;
  subjectName: string | null;
};

export function EditNoteForm({ note, topics }: { note: Note; topics: Topic[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateNoteAction(note.id, formData);
    if (result.success) {
      toast.success("Note updated");
      router.push("/notes");
    } else {
      toast.error("Failed to update note");
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
            <Select name="topicId" defaultValue={String(note.topicId)} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={String(topic.id)}>
                    {topic.subjectName ? `${topic.subjectName} → ${topic.displayName}` : topic.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={note.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={note.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={note.metadata ? JSON.stringify(note.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={note.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/notes")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

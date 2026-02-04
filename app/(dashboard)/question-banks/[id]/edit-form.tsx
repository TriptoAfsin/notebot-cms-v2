"use client";

import { useRouter } from "next/navigation";
import { updateQuestionBankAction } from "@/actions/question-banks.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type QuestionBank = {
  id: number;
  levelId: number;
  subjectSlug: string;
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

export function EditQuestionBankForm({ questionBank, levels }: { questionBank: QuestionBank; levels: Level[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateQuestionBankAction(questionBank.id, formData);
    if (result.success) {
      toast.success("Question bank updated");
      router.push("/question-banks");
    } else {
      toast.error("Failed to update question bank");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Bank Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="levelId">Level</Label>
            <Select name="levelId" defaultValue={String(questionBank.levelId)} required>
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
            <Label htmlFor="subjectSlug">Subject Slug</Label>
            <Input id="subjectSlug" name="subjectSlug" defaultValue={questionBank.subjectSlug} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={questionBank.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={questionBank.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={questionBank.metadata ? JSON.stringify(questionBank.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={questionBank.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/question-banks")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

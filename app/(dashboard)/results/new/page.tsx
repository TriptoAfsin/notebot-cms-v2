"use client";

import { useRouter } from "next/navigation";
import { createResultAction } from "@/actions/results.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewResultPage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createResultAction(formData);
    if (result.success) {
      toast.success("Result created");
      router.push("/results");
    } else {
      toast.error("Failed to create result");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Result</h1>
      <Card>
        <CardHeader>
          <CardTitle>Result Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Result Title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" placeholder="https://example.com/result" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input id="category" name="category" placeholder="Exam Results" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                name="metadata"
                placeholder='{"author": "Name", "year": 2024, "department": "CSE"}'
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/results")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

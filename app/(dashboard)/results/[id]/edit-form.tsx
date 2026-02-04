"use client";

import { useRouter } from "next/navigation";
import { updateResultAction } from "@/actions/results.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Result = {
  id: number;
  title: string;
  url: string;
  category: string | null;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
};

export function EditResultForm({ result }: { result: Result }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const res = await updateResultAction(result.id, formData);
    if (res.success) {
      toast.success("Result updated");
      router.push("/results");
    } else {
      toast.error("Failed to update result");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={result.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={result.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input id="category" name="category" defaultValue={result.category || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={result.metadata ? JSON.stringify(result.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={result.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/results")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

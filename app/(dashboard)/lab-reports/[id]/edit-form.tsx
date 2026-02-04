"use client";

import { useRouter } from "next/navigation";
import { updateLabReportAction } from "@/actions/lab-reports.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type LabReport = {
  id: number;
  levelId: number;
  subjectSlug: string;
  topicName: string;
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

export function EditLabReportForm({ labReport, levels }: { labReport: LabReport; levels: Level[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateLabReportAction(labReport.id, formData);
    if (result.success) {
      toast.success("Lab report updated");
      router.push("/lab-reports");
    } else {
      toast.error("Failed to update lab report");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Report Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="levelId">Level</Label>
            <Select name="levelId" defaultValue={String(labReport.levelId)} required>
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
            <Input id="subjectSlug" name="subjectSlug" defaultValue={labReport.subjectSlug} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topicName">Topic Name</Label>
            <Input id="topicName" name="topicName" defaultValue={labReport.topicName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={labReport.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={labReport.url} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              defaultValue={labReport.metadata ? JSON.stringify(labReport.metadata, null, 2) : ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={labReport.sortOrder} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/lab-reports")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { createRoutineAction } from "@/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Level = {
  id: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
};

export function CreateRoutineForm({ levels }: { levels: Level[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createRoutineAction(formData);
    if (result.success) {
      toast.success("Routine created");
      router.push("/routines");
    } else {
      toast.error("Failed to create routine");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="levelId">Level</Label>
            <Select name="levelId" required>
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
            <Label htmlFor="term">Term (optional)</Label>
            <Input id="term" name="term" placeholder="First" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department (optional)</Label>
            <Input id="department" name="department" placeholder="Computer Engineering" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Routine Title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://example.com/routine.pdf" required />
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
            <Button type="button" variant="outline" onClick={() => router.push("/routines")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

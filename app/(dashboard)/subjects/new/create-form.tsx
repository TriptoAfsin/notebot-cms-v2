"use client";

import { useRouter } from "next/navigation";
import { createSubjectAction } from "@/actions/subjects.action";
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

type Level = {
  id: number;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
};

export function CreateSubjectForm({ levels }: { levels: Level[] }) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createSubjectAction(formData);
    if (result.success) {
      toast.success("Subject created");
      router.push("/subjects");
    } else {
      toast.error("Failed to create subject");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Details</CardTitle>
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="mathematics" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" placeholder="Mathematics" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="mathematics" required />
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
            <Button type="button" variant="outline" onClick={() => router.push("/subjects")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

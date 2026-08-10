"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { toSlug } from "@/lib/slug";
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
  // derived, never typed
  const [displayName, setDisplayName] = useState("");
  const slug = toSlug(displayName, 50);

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
            <Input id="name" value={slug || "—"} readOnly disabled tabIndex={-1} className="font-mono text-xs" />
            <input type="hidden" name="name" value={slug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" placeholder="Mathematics" required
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            {/* Generated from the display name — the slug is part of the URL the engine
                resolves, and hand-typing it produced both "IAE" and "iae" in the tree. */}
            <Input id="slug" value={slug || "—"} readOnly disabled tabIndex={-1}
              aria-describedby="slug-hint" className="font-mono text-xs" />
            <p id="slug-hint" className="text-xs text-muted-foreground">
              Generated from the display name; a clash is resolved automatically.
            </p>
            <input type="hidden" name="slug" value={slug} />
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

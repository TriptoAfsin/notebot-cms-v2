"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateSubmissionConfig } from "@/actions/app-settings";
import { toast } from "sonner";
import { X, Plus, ArrowLeft } from "lucide-react";
import { Link } from "next-view-transitions";

type Config = {
  batches: string[];
  departments: string[];
  levels: string[];
  formTitle: string;
  formDescription: string;
  enabled: boolean;
};

function TagInput({
  label,
  description,
  values,
  onChange,
}: {
  label: string;
  description: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-sm"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((val) => val !== v))}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Add ${label.toLowerCase()}...`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addValue}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SubmissionSettingsForm({ config }: { config: Config }) {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState(config.formTitle);
  const [formDescription, setFormDescription] = useState(config.formDescription);
  const [enabled, setEnabled] = useState(config.enabled);
  const [batches, setBatches] = useState(config.batches);
  const [departments, setDepartments] = useState(config.departments);
  const [levels, setLevels] = useState(config.levels);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSubmissionConfig({
      batches,
      departments,
      levels,
      formTitle,
      formDescription,
      enabled,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Settings saved");
      router.push("/submissions");
    } else {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/submissions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Submissions
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Configure the public submission form title and availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded cursor-pointer accent-primary"
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Accept new submissions
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="formTitle">Form Title</Label>
            <Input
              id="formTitle"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="formDescription">Form Description</Label>
            <Input
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Options</CardTitle>
          <CardDescription>Configure the dropdown options shown in the public submission form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TagInput
            label="Batches"
            description="Student batch options (e.g. 47, 48, 49)"
            values={batches}
            onChange={setBatches}
          />
          <Separator />
          <TagInput
            label="Departments"
            description="Department options (e.g. YE, AE, WPE)"
            values={departments}
            onChange={setDepartments}
          />
          <Separator />
          <TagInput
            label="Levels"
            description="Academic level options (e.g. 1, 2, 3, 4)"
            values={levels}
            onChange={setLevels}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Link href="/submissions">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}

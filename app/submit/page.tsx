"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSubmission } from "@/actions/note-submissions";

const batches = ["47", "48", "49", "50", "51", "52", "EX-Butexian", "Affiliated"];
const departments = ["YE", "AE", "WPE", "IPE", "FE", "DCE", "TEM", "TFD", "TMDM", "ESE", "Others"];
const levels = ["1", "2", "3", "4", "Not Applicable"];

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setLoading(true);

    formData.set("batch", batch);
    formData.set("department", department);
    formData.set("level", level);

    try {
      const result = await createSubmission(formData);
      if (result.success) {
        setSubmitted(true);
      } else if (result.error) {
        const errors = Object.values(result.error).flat().join(", ");
        setError(errors);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Submission Received!</CardTitle>
            <CardDescription>
              Your note has been submitted for review. An admin will review it
              shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/submit/track">
              <Button className="w-full" variant="outline">
                Track Your Submissions
              </Button>
            </Link>
            <Button
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setBatch("");
                setDepartment("");
                setLevel("");
              }}
            >
              Submit Another Note
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Submit a Note</CardTitle>
          <CardDescription>
            Share your notes with the NoteBot community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Your Batch *</Label>
              <Select value={batch} onValueChange={setBatch} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your Department *</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level *</Label>
              <Select value={level} onValueChange={setLevel} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input
                id="subjectName"
                name="subjectName"
                placeholder="e.g. Yarn Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicName">Topic / Chapter Name *</Label>
              <Input
                id="topicName"
                name="topicName"
                placeholder="e.g. Chapter 3 - Fiber Properties"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteLink">Link of the Note *</Label>
              <Input
                id="noteLink"
                name="noteLink"
                type="url"
                placeholder="https://drive.google.com/..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">
                Your Information - Email/Facebook *
              </Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                placeholder="your@email.com or facebook.com/yourprofile"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Note"}
            </Button>

            <div className="text-center">
              <Link
                href="/submit/track"
                className="text-sm text-muted-foreground hover:underline"
              >
                Already submitted? Track your submissions
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

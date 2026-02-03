"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubmission } from "@/actions/note-submissions";
import { CheckCircle2, XCircle } from "lucide-react";

type SubmissionConfig = {
  batches: string[];
  departments: string[];
  levels: string[];
  formTitle: string;
  formDescription: string;
  enabled: boolean;
};

export function SubmitForm({ config }: { config: SubmissionConfig }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  if (!config.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-2">
              <XCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Submissions Closed</CardTitle>
            <CardDescription>
              Note submissions are currently not being accepted. Please check back later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/submit/track">
              <Button variant="outline" className="w-full">
                Track Existing Submissions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">Submission Received</CardTitle>
            <CardDescription>
              Thank you for your contribution! Your note has been submitted and is pending review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/submit/track">
              <Button variant="outline" className="w-full">
                Track Your Submissions
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setErrors({});
              }}
            >
              Submit Another Note
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createSubmission(formData);

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else if (result.error) {
      setErrors(result.error as Record<string, string[]>);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <img src="/notebot-logo.png" alt="NoteBot" width={72} height={72} className="mx-auto mb-2" />
          <CardTitle className="text-2xl">{config.formTitle}</CardTitle>
          <CardDescription>{config.formDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="Enter your full name" required />
              {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="batch">Your Batch <span className="text-destructive">*</span></Label>
              <Select name="batch" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  {config.batches.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.batch && <p className="text-xs text-destructive">{errors.batch[0]}</p>}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Your Department <span className="text-destructive">*</span></Label>
              <Select name="department" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {config.departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-destructive">{errors.department[0]}</p>}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level">Level <span className="text-destructive">*</span></Label>
              <Select name="level" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {config.levels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <p className="text-xs text-destructive">{errors.level[0]}</p>}
            </div>

            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name <span className="text-destructive">*</span></Label>
              <Input id="subjectName" name="subjectName" placeholder="e.g. Engineering Mathematics" required />
              {errors.subjectName && <p className="text-xs text-destructive">{errors.subjectName[0]}</p>}
            </div>

            {/* Topic Name */}
            <div className="space-y-2">
              <Label htmlFor="topicName">Topic / Chapter Name <span className="text-destructive">*</span></Label>
              <Input id="topicName" name="topicName" placeholder="e.g. Differential Equations" required />
              {errors.topicName && <p className="text-xs text-destructive">{errors.topicName[0]}</p>}
            </div>

            {/* Note Link */}
            <div className="space-y-2">
              <Label htmlFor="noteLink">Link of the Note <span className="text-destructive">*</span></Label>
              <Input
                id="noteLink"
                name="noteLink"
                type="url"
                placeholder="https://drive.google.com/..."
                required
              />
              {errors.noteLink && <p className="text-xs text-destructive">{errors.noteLink[0]}</p>}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Your Email / Facebook <span className="text-destructive">*</span></Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                placeholder="your@email.com or facebook.com/yourprofile"
                required
              />
              <p className="text-xs text-muted-foreground">
                Used to notify you about your submission status
              </p>
              {errors.contactInfo && <p className="text-xs text-destructive">{errors.contactInfo[0]}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Note"}
            </Button>

            <div className="text-center">
              <Link
                href="/submit/track"
                className="text-sm text-muted-foreground hover:underline"
              >
                Track your existing submissions
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

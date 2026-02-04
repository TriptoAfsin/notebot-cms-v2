"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubmissions, reviewSubmission, deleteSubmission } from "@/actions/note-submissions.action";
import { toast } from "sonner";

type Submission = {
  id: number;
  name: string;
  batch: string;
  department: string;
  level: string;
  subjectName: string;
  topicName: string;
  noteLink: string;
  contactInfo: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
  }
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    getSubmissions().then((result) => {
      const found = (result.data || []).find(
        (s: Submission) => s.id === id
      );
      setSubmission(found || null);
      setLoading(false);
    });
  }, [id]);

  const handleReview = async (status: "approved" | "rejected") => {
    setReviewing(true);
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("status", status);
    formData.set("reviewNote", reviewNote);

    const result = await reviewSubmission(formData);
    if (result.success) {
      toast.success(`Submission ${status}`);
      router.push("/submissions");
    } else {
      toast.error("Failed to review submission");
    }
    setReviewing(false);
  };

  const handleDelete = async () => {
    const result = await deleteSubmission(id);
    if (result.success) {
      toast.success("Submission deleted");
      router.push("/submissions");
    } else {
      toast.error("Failed to delete submission");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!submission) {
    return <p className="text-muted-foreground">Submission not found.</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Submission Details</h1>
        <StatusBadge status={submission.status} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submission Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Name</dt>
              <dd>{submission.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Batch</dt>
              <dd>{submission.batch}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Department</dt>
              <dd>{submission.department}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Level</dt>
              <dd>{submission.level}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Subject Name
              </dt>
              <dd>{submission.subjectName}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Topic Name</dt>
              <dd>{submission.topicName}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium text-muted-foreground">Note Link</dt>
              <dd>
                <a
                  href={submission.noteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {submission.noteLink}
                </a>
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium text-muted-foreground">
                Contact Info
              </dt>
              <dd>{submission.contactInfo}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Submitted At
              </dt>
              <dd>{new Date(submission.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {submission.status !== "pending" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">
                  Reviewed At
                </dt>
                <dd>
                  {submission.reviewedAt
                    ? new Date(submission.reviewedAt).toLocaleString()
                    : "-"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-muted-foreground">
                  Admin Note
                </dt>
                <dd>{submission.reviewNote || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {submission.status === "pending" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNote">Note (optional)</Label>
              <Textarea
                id="reviewNote"
                placeholder="Add a note for the submitter..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleReview("approved")}
                disabled={reviewing}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview("rejected")}
                disabled={reviewing}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/submissions")}>
          Back to Submissions
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Submission
        </Button>
      </div>
    </div>
  );
}

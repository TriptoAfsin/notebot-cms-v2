"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import * as submissionService from "@/services/note-submissions";
import { sendSubmissionAcknowledgement, sendSubmissionReviewNotification, sendNewSubmissionNotification } from "@/lib/email";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function getSubmissions(status?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  return { data: await submissionService.getAll(status) };
}

const submissionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  batch: z.string().min(1, "Batch is required"),
  department: z.string().min(1, "Department is required"),
  level: z.string().min(1, "Level is required"),
  subjectName: z.string().min(1, "Subject name is required").max(255),
  topicName: z.string().min(1, "Topic name is required").max(255),
  noteLink: z.string().url("Must be a valid URL").max(1000),
  contactInfo: z.string().min(1, "Contact info is required").max(500),
});

export async function createSubmission(formData: FormData) {
  const parsed = submissionSchema.safeParse({
    name: formData.get("name"),
    batch: formData.get("batch"),
    department: formData.get("department"),
    level: formData.get("level"),
    subjectName: formData.get("subjectName"),
    topicName: formData.get("topicName"),
    noteLink: formData.get("noteLink"),
    contactInfo: formData.get("contactInfo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await submissionService.create(parsed.data);

  // Send acknowledgement email if contactInfo looks like an email
  if (parsed.data.contactInfo.includes("@")) {
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    await sendSubmissionAcknowledgement({
      to: parsed.data.contactInfo,
      name: parsed.data.name,
      subjectName: parsed.data.subjectName,
      topicName: parsed.data.topicName,
      trackUrl: `${baseUrl}/submit/track`,
    }).catch(() => {});
  }

  // Notify admin via CONTACT_TO_EMAIL
  const contactTo = process.env.CONTACT_TO_EMAIL;
  if (contactTo) {
    await sendNewSubmissionNotification({
      to: contactTo,
      ...parsed.data,
    }).catch(() => {});
  }

  return { success: true };
}

export async function trackSubmissions(contactInfo: string) {
  if (!contactInfo.trim()) {
    return { error: "Contact info is required" };
  }
  const submissions = await submissionService.getByContact(contactInfo.trim());
  return { data: submissions };
}

const reviewSchema = z.object({
  id: z.coerce.number().int(),
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().optional(),
});

export async function reviewSubmission(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    reviewNote: formData.get("reviewNote"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Fetch submission before review to get contact info
  const submission = await submissionService.getById(parsed.data.id);

  await submissionService.review(parsed.data.id, {
    status: parsed.data.status,
    reviewedBy: session.user.id,
    reviewNote: parsed.data.reviewNote,
  });

  // Send review notification if contactInfo looks like an email
  if (submission && submission.contactInfo.includes("@")) {
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    await sendSubmissionReviewNotification({
      to: submission.contactInfo,
      name: submission.name,
      subjectName: submission.subjectName,
      topicName: submission.topicName,
      status: parsed.data.status,
      reviewNote: parsed.data.reviewNote,
      trackUrl: `${baseUrl}/submit/track`,
    }).catch(() => {});
  }

  revalidatePath("/submissions");
  return { success: true };
}

export async function deleteSubmission(id: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await submissionService.deleteById(id);
  revalidatePath("/submissions");
  return { success: true };
}

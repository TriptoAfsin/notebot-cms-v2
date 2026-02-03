import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "NoteBot <noreply@notebot.com>";

export async function sendInvitationEmail({
  to,
  inviteUrl,
  role,
}: {
  to: string;
  inviteUrl: string;
  role: string;
}) {
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: "You're invited to NoteBot CMS",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You've Been Invited!</h2>
        <p>You've been invited to join <strong>NoteBot CMS</strong> as a <strong>${role}</strong>.</p>
        <p>Click the button below to create your account:</p>
        <a href="${inviteUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 13px;">Or copy this link: ${inviteUrl}</p>
        <p style="color: #666; font-size: 13px;">This invitation will expire in a few days. If you didn't expect this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendSubmissionAcknowledgement({
  to,
  name,
  subjectName,
  topicName,
  trackUrl,
}: {
  to: string;
  name: string;
  subjectName: string;
  topicName: string;
  trackUrl: string;
}) {
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: "Note Submission Received - NoteBot",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Submission Received!</h2>
        <p>Hi ${name},</p>
        <p>We've received your note submission and it's now under review.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Subject</td><td style="padding: 6px 0; font-weight: 600;">${subjectName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Topic</td><td style="padding: 6px 0; font-weight: 600;">${topicName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Status</td><td style="padding: 6px 0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 13px;">Pending</span></td></tr>
        </table>
        <p>You can track your submission status anytime:</p>
        <a href="${trackUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Track Submissions
        </a>
        <p style="color: #666; font-size: 13px;">Thank you for contributing to NoteBot!</p>
      </div>
    `,
  });
}

export async function sendNewSubmissionNotification({
  to,
  name,
  batch,
  department,
  level,
  subjectName,
  topicName,
  noteLink,
  contactInfo,
}: {
  to: string;
  name: string;
  batch: string;
  department: string;
  level: string;
  subjectName: string;
  topicName: string;
  noteLink: string;
  contactInfo: string;
}) {
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `New Note Submission from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #45a243;">New Note Submission</h2>
        <p>A new note has been submitted and is awaiting review.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Batch</td><td style="padding: 8px 0;">${batch}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Department</td><td style="padding: 8px 0;">${department}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Level</td><td style="padding: 8px 0;">${level}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Subject</td><td style="padding: 8px 0; font-weight: 600;">${subjectName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Topic</td><td style="padding: 8px 0; font-weight: 600;">${topicName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Note Link</td><td style="padding: 8px 0;"><a href="${noteLink}" style="color: #45a243;">${noteLink}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Contact</td><td style="padding: 8px 0;">${contactInfo}</td></tr>
        </table>
        <p style="color: #666; font-size: 13px;">Log in to the CMS to review this submission.</p>
      </div>
    `,
  });
}

export async function sendSubmissionReviewNotification({
  to,
  name,
  subjectName,
  topicName,
  status,
  reviewNote,
  trackUrl,
}: {
  to: string;
  name: string;
  subjectName: string;
  topicName: string;
  status: "approved" | "rejected";
  reviewNote?: string;
  trackUrl: string;
}) {
  const isApproved = status === "approved";
  const statusColor = isApproved ? "#dcfce7" : "#fee2e2";
  const statusTextColor = isApproved ? "#166534" : "#991b1b";
  const statusLabel = isApproved ? "Approved" : "Rejected";

  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `Note Submission ${statusLabel} - NoteBot`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Submission ${statusLabel}</h2>
        <p>Hi ${name},</p>
        <p>Your note submission has been <strong>${status}</strong> by an admin.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Subject</td><td style="padding: 6px 0; font-weight: 600;">${subjectName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Topic</td><td style="padding: 6px 0; font-weight: 600;">${topicName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Status</td><td style="padding: 6px 0;"><span style="background: ${statusColor}; color: ${statusTextColor}; padding: 2px 8px; border-radius: 12px; font-size: 13px;">${statusLabel}</span></td></tr>
          ${reviewNote ? `<tr><td style="padding: 6px 0; color: #666;">Note</td><td style="padding: 6px 0;">${reviewNote}</td></tr>` : ""}
        </table>
        <a href="${trackUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          View All Submissions
        </a>
        <p style="color: #666; font-size: 13px;">Thank you for contributing to NoteBot!</p>
      </div>
    `,
  });
}

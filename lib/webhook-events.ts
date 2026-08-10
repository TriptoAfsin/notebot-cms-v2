/**
 * The event vocabulary, with no imports.
 *
 * Kept separate from lib/webhooks.ts on purpose: that module imports the database client, and a
 * client component reaching in for this constant pulls `pg` into the browser bundle, which then
 * fails to resolve node builtins (dns/fs/net/tls) at build time. Anything a client component
 * needs to know about webhooks belongs here.
 */
export const WEBHOOK_EVENTS = [
  "submission.created",
  "submission.approved",
  "submission.rejected",
  "note.created",
  "note.updated",
  "note.deleted",
  "topic.created",
  "subject.created",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { webhookDeliveries, webhooks } from "@/lib/db/schema";

/**
 * Outbound webhook delivery.
 *
 * Signed so a receiver can prove the call came from us: `X-NoteBot-Signature` is
 * `sha256=<hmac>` over `<timestamp>.<body>`, with the timestamp sent separately. Binding the
 * timestamp into the signed string is what stops a captured request being replayed later — a
 * signature over the body alone stays valid forever.
 *
 * Delivery never blocks or fails the write that triggered it. A form submission must not be
 * rejected because someone's endpoint is down.
 */

// The vocabulary lives in a dependency-free module so client components can import it without
// dragging this file's database client — and therefore `pg` — into the browser bundle.
export { WEBHOOK_EVENTS, type WebhookEvent } from "@/lib/webhook-events";
import { WEBHOOK_EVENTS, type WebhookEvent } from "@/lib/webhook-events";

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;
/** After this many consecutive failures an endpoint is disabled rather than retried forever. */
const FAILURE_LIMIT = 15;
const MAX_BODY_LOG = 2000;

export const newWebhookSecret = () => `whsec_${randomBytes(24).toString("base64url")}`;

export function sign(secret: string, timestamp: string, body: string) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

/** Exported so a receiver written against this codebase can verify with the same code. */
export function verifySignature(secret: string, timestamp: string, body: string, header: string) {
  const expected = Buffer.from(sign(secret, timestamp, body));
  const given = Buffer.from(header ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function deliver(hook: { id: number; url: string; secret: string }, event: WebhookEvent, payload: Record<string, unknown>) {
  const body = JSON.stringify({ event, sentAt: new Date().toISOString(), data: payload });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const startedAt = Date.now();

  let attempt = 0;
  let status: number | null = null;
  let responseBody = "";
  let error: string | null = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NoteBot-Event": event,
          "X-NoteBot-Timestamp": timestamp,
          "X-NoteBot-Signature": sign(hook.secret, timestamp, body),
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      status = res.status;
      responseBody = (await res.text().catch(() => "")).slice(0, MAX_BODY_LOG);
      if (res.ok) { error = null; break; }
      error = `HTTP ${res.status}`;
      // 4xx other than 429 is the receiver rejecting the payload — retrying cannot help
      if (res.status !== 429 && res.status < 500) break;
    } catch (err: unknown) {
      status = 0;
      error = err instanceof Error ? err.message.slice(0, 300) : "request failed";
    }
    if (attempt < MAX_ATTEMPTS) await sleep(500 * 2 ** (attempt - 1));
  }

  const ok = status !== null && status >= 200 && status < 300;

  await db.insert(webhookDeliveries).values({
    webhookId: hook.id,
    event,
    responseStatus: status,
    responseBody: responseBody || null,
    error,
    attempts: attempt,
    durationMs: Date.now() - startedAt,
    payload,
  });

  if (ok) {
    await db.update(webhooks).set({ consecutiveFailures: 0 }).where(eq(webhooks.id, hook.id));
  } else {
    const [row] = await db
      .update(webhooks)
      .set({ consecutiveFailures: sql`${webhooks.consecutiveFailures} + 1` })
      .where(eq(webhooks.id, hook.id))
      .returning({ failures: webhooks.consecutiveFailures });
    if ((row?.failures ?? 0) >= FAILURE_LIMIT) {
      await db
        .update(webhooks)
        .set({ enabled: false, disabledReason: `Disabled automatically after ${FAILURE_LIMIT} consecutive failures (last: ${error ?? "unknown"})` })
        .where(eq(webhooks.id, hook.id));
    }
  }
}

/**
 * Fires an event to every enabled endpoint subscribed to it.
 *
 * Intentionally not awaited by callers: this returns a promise that is allowed to settle after
 * the response has been sent. Errors are swallowed and recorded, never propagated.
 */
export async function dispatchWebhooks(event: WebhookEvent, payload: Record<string, unknown>) {
  try {
    const hooks = await db
      .select({ id: webhooks.id, url: webhooks.url, secret: webhooks.secret, events: webhooks.events })
      .from(webhooks)
      .where(eq(webhooks.enabled, true));

    // an empty events array means "everything"
    const targets = hooks.filter((h) => !h.events?.length || h.events.includes(event));
    await Promise.allSettled(targets.map((h) => deliver(h, event, payload)));
  } catch (err) {
    console.error("[webhooks] dispatch failed for", event, err);
  }
}

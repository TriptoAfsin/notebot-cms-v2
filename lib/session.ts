import { headers } from "next/headers";

import { auth } from "@/lib/auth";

/**
 * Shared session access for server actions.
 *
 * This idiom used to be copy-pasted into users/invitations/app-settings/note-submissions and
 * absent from every content action, so levels, subjects, topics, notes, lab reports, question
 * banks, routines, results and syllabuses were writable by anyone who could reach the action
 * endpoint. proxy.ts only checks that a session cookie *exists* — it never validates it — so it
 * is a routing convenience, not an authorization boundary.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSession>>
>["user"];

/**
 * Returns the signed-in user, or null when there is no valid session.
 *
 * Actions should bail with `{ error: "Unauthorized" }` on null rather than throwing, so the
 * failure surfaces through the same `{ success } | { error }` contract every form already
 * handles instead of becoming an unhandled server-action rejection.
 */
export async function requireUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Typed to carry `success?: undefined` so it unions cleanly with the existing
 * `{ error: fieldErrors }` branch. Without it, `if (result.success)` in every form fails to
 * typecheck against the new union.
 */
export const UNAUTHORIZED: { error: string; success?: undefined } = {
  error: "Unauthorized",
};

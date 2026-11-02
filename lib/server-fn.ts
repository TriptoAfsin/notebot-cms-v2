import { createMiddleware } from "@tanstack/react-start";

/**
 * Glue that lets every `actions/*.action.ts` export keep its original call signature
 * (`createNoteAction(formData)`, `updateNoteAction(id, formData)`, `getNotesAction(topicId)`) while
 * running as a TanStack Start server function.
 *
 * Server functions take a single payload, and FormData is only transported when it *is* the payload.
 * `packArgs` therefore sends:
 *   - a FormData copy carrying the other arguments as JSON under `__args`, when any argument is
 *     FormData (the action's FormData parameter is restored in place on the server), or
 *   - `{ args }` otherwise, serialized by Start's serializer (Dates, Maps, etc. survive).
 */
const FORM_SLOT = "__FORMDATA__";
const ARGS_KEY = "__args";

export function packArgs(args: unknown[]): FormData | { args: unknown[] } {
  const i = args.findIndex((a) => typeof FormData !== "undefined" && a instanceof FormData);
  if (i === -1) return { args };
  const fd = new FormData();
  (args[i] as FormData).forEach((v, k) => fd.append(k, v));
  fd.set(ARGS_KEY, JSON.stringify(args.map((a, j) => (j === i ? FORM_SLOT : a))));
  return fd;
}

export function unpackArgs(data: unknown): unknown[] {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const meta = JSON.parse(String(data.get(ARGS_KEY) ?? "[]")) as unknown[];
    data.delete(ARGS_KEY);
    return meta.map((a) => (a === FORM_SLOT ? data : a));
  }
  if (data && typeof data === "object" && Array.isArray((data as { args?: unknown }).args)) {
    return (data as { args: unknown[] }).args;
  }
  return [];
}

export const passThrough = (d: unknown) => d as FormData | { args: unknown[] };

/**
 * Every CMS server function requires a signed-in user, except the handful the public pages use
 * (see PUBLIC_ACTIONS in scripts/port-actions.mjs). Under Next.js each Server Action was a public
 * POST endpoint and most reads had no check at all, so e.g. `getSubmissions` (submitter contact
 * details) was callable anonymously. Mutations keep their in-body `requireUser()` checks too.
 */
export const requireSession = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return next();
});

import { createCsrfMiddleware, createMiddleware, createStart, getRouterInstance } from "@tanstack/react-start";

/**
 * Replaces Next's `revalidatePath()`: after any mutating server function (POST) finishes in the
 * browser, re-run the active route loaders so lists and counts reflect the change. Reads (GET) are
 * left alone, otherwise a loader's own fetch would trigger another invalidation.
 */
const refreshAfterMutation = createMiddleware({ type: "function" }).client(async ({ next, method }) => {
  const result = await next();
  if (method === "POST") {
    const router = await getRouterInstance();
    void router.invalidate();
  }
  return result;
});

/**
 * Server functions are cookie-authenticated POST endpoints, so a page on another site could submit
 * to them with the admin's session. Reject server-function requests that are not same-origin
 * (Sec-Fetch-Site, falling back to Origin/Referer). API routes keep their own auth (API keys).
 */
const csrf = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });

export const startInstance = createStart(() => ({
  requestMiddleware: [csrf],
  functionMiddleware: [refreshAfterMutation],
}));

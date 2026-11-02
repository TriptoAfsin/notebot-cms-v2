import { createMiddleware, createStart, getRouterInstance } from "@tanstack/react-start";

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

export const startInstance = createStart(() => ({
  functionMiddleware: [refreshAfterMutation],
}));

import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

/** Better Auth endpoints (sign-in, sign-up, session, sign-out) under /api/auth/*. */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});

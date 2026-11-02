import { createServerFn } from "@tanstack/react-start";

/** The signed-in user for route guards, or null. Validates the session against the database. */
export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session?.user) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

/**
 * Browser-only memo of the signed-in user for the dashboard route guard.
 *
 * Never used on the server: a module-level value there would be shared between requests from
 * different people. Signing out must call `forgetUser()`, or the shell would still render for up
 * to a minute (every server function would still refuse, since they check the session themselves).
 */
type User = { id: string; name: string; email: string };

const TTL_MS = 60_000;
let entry: { user: User; at: number } | null = null;

export function cachedUser(): User | null {
  if (typeof window === "undefined" || !entry) return null;
  return Date.now() - entry.at < TTL_MS ? entry.user : null;
}

export function rememberUser(user: User) {
  if (typeof window === "undefined") return;
  if (entry?.user.id !== user.id || Date.now() - entry.at >= TTL_MS) entry = { user, at: Date.now() };
}

export function forgetUser() {
  entry = null;
}

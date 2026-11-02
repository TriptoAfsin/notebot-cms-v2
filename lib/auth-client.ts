import { createAuthClient } from "better-auth/react";

// The client always talks to the origin it was served from. (Under Next.js this read
// NEXT_PUBLIC_BETTER_AUTH_URL, which Vite does not expose to the browser; falling back to
// localhost would break sign-in in production.)
export const authClient = createAuthClient(
  typeof window === "undefined" ? {} : { baseURL: window.location.origin }
);

export const { signIn, signUp, signOut, useSession } = authClient;

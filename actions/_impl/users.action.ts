// Server-only implementation. Import through actions/users.action.ts (server functions).
import { headers } from "@/lib/request-headers";
import { auth } from "@/lib/auth";
import * as userService from "@/services/users.service";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function getUsers() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  return { data: await userService.getAll() };
}

export async function deleteUser(id: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (session.user.id === id) {
    return { error: "Cannot delete your own account" };
  }

  await userService.deleteById(id);
  return { success: true };
}

// Server-only implementation. Import through actions/app-settings.action.ts (server functions).
import { headers } from "@/lib/request-headers";
import { auth } from "@/lib/auth";
import * as settingsService from "@/services/app-settings.service";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getSubmissionConfig() {
  return settingsService.getSubmissionConfig();
}

export async function updateSubmissionConfig(data: {
  batches: string[];
  departments: string[];
  levels: string[];
  formTitle: string;
  formDescription: string;
  enabled: boolean;
}) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await settingsService.setSetting("submission_form", data);
  return { success: true };
}

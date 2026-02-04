import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  if (rows.length === 0) return null;
  return rows[0].value as T;
}

export async function setSetting(key: string, value: unknown) {
  const existing = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(appSettings)
      .set({ value: value as Record<string, unknown>, updatedAt: new Date() })
      .where(eq(appSettings.key, key));
  } else {
    await db.insert(appSettings).values({
      key,
      value: value as Record<string, unknown>,
      updatedAt: new Date(),
    });
  }
}

export async function getAllSettings() {
  return db.select().from(appSettings);
}

// Default submission form config
export const DEFAULT_SUBMISSION_CONFIG = {
  batches: ["47", "48", "49", "50", "51", "52", "EX-Butexian", "Affiliated"],
  departments: ["YE", "AE", "WPE", "IPE", "FE", "DCE", "TEM", "TFD", "TMDM", "ESE", "Others"],
  levels: ["1", "2", "3", "4", "Not Applicable"],
  formTitle: "Submit a Note",
  formDescription: "Share your notes with the NoteBot community",
  enabled: true,
};

export type SubmissionConfig = typeof DEFAULT_SUBMISSION_CONFIG;

export async function getSubmissionConfig(): Promise<SubmissionConfig> {
  const config = await getSetting<SubmissionConfig>("submission_form");
  return { ...DEFAULT_SUBMISSION_CONFIG, ...config };
}

import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { DEFAULT_TAXONOMY, TAXONOMY_KEY } from "@/lib/taxonomy";
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

// Default submission form config.
//
// The vocabularies here are seeded from lib/taxonomy.ts rather than written out again: keeping a
// second copy is how the CMS came to offer TEM but not TME while note titles already used TME.
// Anything shared lives in the taxonomy; only form-specific copy belongs to this key.
export const DEFAULT_SUBMISSION_CONFIG = {
  batches: DEFAULT_TAXONOMY.batches,
  departments: DEFAULT_TAXONOMY.departments,
  levels: DEFAULT_TAXONOMY.levels,
  formTitle: "Submit a Note",
  formDescription: "Share your notes with the NoteBot community",
  enabled: true,
};

export type SubmissionConfig = typeof DEFAULT_SUBMISSION_CONFIG;

/**
 * The submit form's config, with the shared vocabularies overlaid last.
 *
 * Order matters: the taxonomy wins over anything stored under `submission_form`, so editing
 * departments in one place changes the public form too. Otherwise a stale copy saved months ago
 * would keep shadowing it.
 */
export async function getSubmissionConfig(): Promise<SubmissionConfig> {
  const [config, taxonomy] = await Promise.all([
    getSetting<SubmissionConfig>("submission_form"),
    getSetting<Partial<typeof DEFAULT_TAXONOMY>>(TAXONOMY_KEY),
  ]);
  return {
    ...DEFAULT_SUBMISSION_CONFIG,
    ...config,
    departments: taxonomy?.departments?.length ? taxonomy.departments : DEFAULT_TAXONOMY.departments,
    batches: taxonomy?.batches?.length ? taxonomy.batches : DEFAULT_TAXONOMY.batches,
    levels: taxonomy?.levels?.length ? taxonomy.levels : DEFAULT_TAXONOMY.levels,
  };
}

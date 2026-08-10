/**
 * The controlled vocabularies used across the whole app: departments, batches, levels and note
 * kinds.
 *
 * One list, one place. Before this there were two: `DEFAULT_SUBMISSION_CONFIG` drove the public
 * submit form, and lib/note-title.ts carried a hardcoded copy for the CMS — which is how the CMS
 * ended up offering TEM but not TME, while note titles in the database already used TME.
 *
 * No imports on purpose. This module is read by client components; pulling the database client in
 * here would drag `pg` into the browser bundle and break the build.
 */

export const DEFAULT_TAXONOMY = {
  departments: [
    "YE", "AE", "WPE", "IPE", "FE", "DCE",
    "TEM",   // Textile Engineering Management
    "TME",   // distinct from TEM — already used by existing note titles
    "TFD", "TMDM", "ESE",
    "Affli. College",
    "Others",
  ],
  batches: ["47", "48", "49", "50", "51", "52", "EX-Butexian", "Affiliated"],
  levels: ["1", "2", "3", "4", "Not Applicable"],
  /** the leading label on a note title, most common first — see lib/note-title.ts */
  noteKinds: [
    "Hand Note", "Sheet", "Slide", "Class Lecture", "Book", "Book Scanned",
    "QB Solve", "Suggestion", "Part-A", "Part-B", "Full Notes",
  ],
};

export type Taxonomy = typeof DEFAULT_TAXONOMY;
export type TaxonomyField = keyof Taxonomy;

export const TAXONOMY_KEY = "content_taxonomy";

export const TAXONOMY_LABELS: Record<TaxonomyField, string> = {
  departments: "Departments",
  batches: "Batches",
  levels: "Levels",
  noteKinds: "Note kinds",
};

export const TAXONOMY_HINTS: Record<TaxonomyField, string> = {
  departments: "Used in note titles as DEPT-BATCH, in the public submit form, and in note metadata.",
  batches: "Offered on the submit form and in the note-title builder.",
  levels: "Offered on the submit form. Academic levels themselves live in the Levels table.",
  noteKinds: "The leading label on a composed note title, e.g. “Hand Note(…)”.",
};

/** Trim, drop blanks, de-duplicate case-insensitively, preserve order. */
export function normaliseList(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = String(raw ?? "").trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

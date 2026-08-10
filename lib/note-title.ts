/**
 * Composes a note title in the house format.
 *
 * The corpus is overwhelmingly consistent — 756 of the titles that carry attribution start
 * "Hand Note", then "Sheet" (105), "Slide", "Class Lecture", "Book Scanned", "QB Solve" — and the
 * attribution is always `(author, DEPT-BATCH, year)` with parts omitted when unknown:
 *
 *   Hand Note(Jeba Fariha, TME-51, 2026)
 *   Hand Note(Akib, 2018)          — no department or batch
 *   Sheet(2019)                    — no author
 *   Slide                          — nothing known
 *
 * Typing that by hand is how "Hand Note " (57 rows) and "Sheet " (22 rows) ended up with trailing
 * spaces, and why batches appear as both "TME-51" and "TME51".
 */

/** The labels actually in use, most common first. */
export const NOTE_KINDS = [
  "Hand Note",
  "Sheet",
  "Slide",
  "Class Lecture",
  "Book",
  "Book Scanned",
  "QB Solve",
  "Suggestion",
  "Part-A",
  "Part-B",
  "Full Notes",
] as const;

/** Mirrors DEFAULT_SUBMISSION_CONFIG in services/app-settings.service.ts. */
export const DEPARTMENTS = [
  "YE", "AE", "WPE", "IPE", "FE", "DCE", "TEM", "TFD", "TMDM", "ESE", "Others",
] as const;

export type TitleParts = {
  kind: string;
  author?: string;
  department?: string;
  batch?: string;
  year?: string;
};

export function composeNoteTitle(parts: TitleParts): string {
  const kind = (parts.kind ?? "").trim();
  const author = (parts.author ?? "").trim();
  const department = (parts.department ?? "").trim();
  const batch = (parts.batch ?? "").trim();
  const year = (parts.year ?? "").trim();

  // department and batch travel together as DEPT-BATCH; either alone is still useful
  const cohort = department && batch ? `${department}-${batch}` : department || batch;

  const inside = [author, cohort, year].filter(Boolean).join(", ");
  if (!kind) return inside;          // no label — return the attribution alone
  return inside ? `${kind}(${inside})` : kind;
}

/**
 * Best-effort parse of an existing title back into parts, so editing a note does not force the
 * author to be retyped. Returns null when the title does not follow the format — a free-text
 * title should stay free text rather than be mangled into fields.
 */
export function parseNoteTitle(title: string): TitleParts | null {
  const m = String(title ?? "").match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (!m) return null;

  const kind = m[1].trim();
  const segments = m[2].split(",").map((s) => s.trim()).filter(Boolean);

  let author = "", department = "", batch = "", year = "";
  for (const seg of segments) {
    if (/^\d{4}$/.test(seg)) { year = seg; continue; }
    const cohort = seg.match(/^([A-Za-z]{2,5})\s*-?\s*(\d{1,3})$/);
    if (cohort) { department = cohort[1].toUpperCase(); batch = cohort[2]; continue; }
    if (!author) author = seg;
  }
  return { kind, author, department, batch, year };
}

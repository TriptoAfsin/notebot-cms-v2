/**
 * Slug generation.
 *
 * Slugs are part of the URL contract — the engine resolves `/app/notes/1/fpc/fpcDegradation` by
 * slug — so they are derived, not typed. Hand-typed slugs are how the tree ended up with both
 * `IAE` and `iae`, and with `chem1books` sitting beside a v1 route of `chem1_books_flow`.
 *
 * No imports: read by client components.
 */

/** Lowercase, alphanumerics and underscores only — matching what the engine's lookup expects. */
export function toSlug(input: string, max = 100): string {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, max);
}

/**
 * Appends `_2`, `_3`, … until the slug is free.
 *
 * `subjects.slug` and `topics.slug` have no unique constraint, so two rows can share one and the
 * engine then resolves them nondeterministically — whichever the query returns first. Rejecting
 * the save would be safe but useless: the editor has no way to know what is already taken, and
 * "Polymer Degradation" is a perfectly reasonable name to reuse under a different subject.
 *
 * `taken` is compared case-insensitively because the engine's lookup is.
 */
export function uniqueSlug(base: string, taken: Iterable<string>, max = 100): string {
  const used = new Set([...taken].map((t) => String(t).toLowerCase()));
  const root = toSlug(base, max) || "item";
  if (!used.has(root)) return root;

  for (let n = 2; n < 1000; n++) {
    const suffix = `_${n}`;
    const candidate = root.slice(0, max - suffix.length) + suffix;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  // 998 collisions on one name is not a real scenario, but never return a known duplicate
  return `${root.slice(0, max - 14)}_${Date.now().toString(36)}`;
}

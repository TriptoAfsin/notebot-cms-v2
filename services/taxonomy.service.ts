import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  DEFAULT_TAXONOMY, TAXONOMY_KEY, type Taxonomy, type TaxonomyField,
} from "@/lib/taxonomy";
import { getSetting, setSetting } from "@/services/app-settings.service";

export async function getTaxonomy(): Promise<Taxonomy> {
  const stored = await getSetting<Partial<Taxonomy>>(TAXONOMY_KEY);
  // merged per-field, so adding a new vocabulary later does not require a data migration
  return {
    departments: stored?.departments?.length ? stored.departments : DEFAULT_TAXONOMY.departments,
    batches: stored?.batches?.length ? stored.batches : DEFAULT_TAXONOMY.batches,
    levels: stored?.levels?.length ? stored.levels : DEFAULT_TAXONOMY.levels,
    noteKinds: stored?.noteKinds?.length ? stored.noteKinds : DEFAULT_TAXONOMY.noteKinds,
  };
}

export async function saveTaxonomy(next: Taxonomy) {
  await setSetting(TAXONOMY_KEY, next);
}

export type UsageCount = {
  value: string;
  /** rows that name this value explicitly, in metadata or a submission column */
  tagged: number;
  /** note titles that embed it as text, e.g. "…(Jeba, TME-51, 2026)" */
  inTitles: number;
  total: number;
};

/**
 * How much existing data refers to each value.
 *
 * Removing a value from a list does not delete anything by itself — but it makes that data
 * unreachable from every dropdown, so it can no longer be found, filtered or corrected through
 * the UI. That is indistinguishable from data loss to whoever is looking for it, which is why
 * removal has to state the count and be confirmed rather than just applied.
 */
export async function getTaxonomyUsage(field: TaxonomyField, values: string[]): Promise<UsageCount[]> {
  if (!values.length) return [];

  // drizzle expands a JS array into a parameter tuple — `${values}::text[]` becomes
  // `($1, $2, ...)::text[]`, which Postgres rejects as "cannot cast type record to text[]".
  // Building ARRAY[$1, $2, ...] explicitly keeps every value parameterised.
  const arr = sql`ARRAY[${sql.join(values.map((v) => sql`${v}`), sql`, `)}]::text[]`;

  if (field === "departments") {
    const { rows } = await db.execute<{ value: string; tagged: number; in_titles: number }>(sql`
      SELECT v.value,
        ( (SELECT COUNT(*) FROM note_submissions s WHERE lower(s.department) = lower(v.value))
        + (SELECT COUNT(*) FROM notes n  WHERE lower(n.metadata->>'department') = lower(v.value))
        + (SELECT COUNT(*) FROM topics t WHERE lower(t.metadata->>'department') = lower(v.value))
        )::int AS tagged,
        (SELECT COUNT(*) FROM notes n2 WHERE n2.title ILIKE '%(' || v.value || '-%'
                                          OR n2.title ILIKE '%, ' || v.value || '-%'
                                          OR n2.title ILIKE '%,' || v.value || '-%')::int AS in_titles
      FROM unnest(${arr}) AS v(value)
    `);
    return rows.map((r) => ({
      value: r.value, tagged: Number(r.tagged), inTitles: Number(r.in_titles),
      total: Number(r.tagged) + Number(r.in_titles),
    }));
  }

  if (field === "batches") {
    const { rows } = await db.execute<{ value: string; tagged: number; in_titles: number }>(sql`
      SELECT v.value,
        (SELECT COUNT(*) FROM note_submissions s WHERE lower(s.batch) = lower(v.value))::int AS tagged,
        (SELECT COUNT(*) FROM notes n WHERE n.title ILIKE '%-' || v.value || ',%'
                                         OR n.title ILIKE '%-' || v.value || ')%'
                                         OR n.title ILIKE '%-' || v.value || ' %')::int AS in_titles
      FROM unnest(${arr}) AS v(value)
    `);
    return rows.map((r) => ({
      value: r.value, tagged: Number(r.tagged), inTitles: Number(r.in_titles),
      total: Number(r.tagged) + Number(r.in_titles),
    }));
  }

  if (field === "levels") {
    const { rows } = await db.execute<{ value: string; tagged: number }>(sql`
      SELECT v.value,
        (SELECT COUNT(*) FROM note_submissions s WHERE lower(s.level) = lower(v.value))::int AS tagged
      FROM unnest(${arr}) AS v(value)
    `);
    return rows.map((r) => ({ value: r.value, tagged: Number(r.tagged), inTitles: 0, total: Number(r.tagged) }));
  }

  // noteKinds: the label is the text before "(" on a composed title
  const { rows } = await db.execute<{ value: string; in_titles: number }>(sql`
    SELECT v.value,
      (SELECT COUNT(*) FROM notes n WHERE split_part(n.title, '(', 1) = v.value
                                       OR split_part(n.title, '(', 1) = v.value || ' ')::int AS in_titles
    FROM unnest(${arr}) AS v(value)
  `);
  return rows.map((r) => ({ value: r.value, tagged: 0, inTitles: Number(r.in_titles), total: Number(r.in_titles) }));
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import { requireUser, UNAUTHORIZED } from "@/lib/session";
import { normaliseList, type Taxonomy, type TaxonomyField } from "@/lib/taxonomy";
import { getTaxonomy, getTaxonomyUsage, saveTaxonomy, type UsageCount } from "@/services/taxonomy.service";

export async function getTaxonomyAction() {
  if (!(await requireUser())) return null;
  return getTaxonomy();
}

/** Usage counts for the values currently configured, so the editor can see what is in use. */
export async function getUsageAction(field: TaxonomyField, values: string[]): Promise<UsageCount[]> {
  if (!(await requireUser())) return [];
  return getTaxonomyUsage(field, values);
}

const schema = z.object({
  departments: z.array(z.string()).min(1, "Keep at least one department"),
  batches: z.array(z.string()).min(1, "Keep at least one batch"),
  levels: z.array(z.string()).min(1, "Keep at least one level"),
  noteKinds: z.array(z.string()).min(1, "Keep at least one note kind"),
});

/**
 * Saves the vocabularies.
 *
 * Removals are checked against real data first. Dropping a value does not delete rows, but it
 * removes the only way to reach them from the UI — nothing will filter to them and no dropdown
 * offers them again — so a removal that would orphan data is refused unless `confirm` is passed.
 * The caller gets the counts back so it can say what would be affected instead of asking blindly.
 */
export async function saveTaxonomyAction(next: Taxonomy, confirm = false) {
  if (!(await requireUser())) return UNAUTHORIZED;

  const cleaned: Taxonomy = {
    departments: normaliseList(next.departments),
    batches: normaliseList(next.batches),
    levels: normaliseList(next.levels),
    noteKinds: normaliseList(next.noteKinds),
  };

  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: undefined };
  }

  const current = await getTaxonomy();
  const fields: TaxonomyField[] = ["departments", "batches", "levels", "noteKinds"];

  const orphaning: Array<{ field: TaxonomyField; usage: UsageCount[] }> = [];
  for (const field of fields) {
    const removed = current[field].filter(
      (v) => !cleaned[field].some((k) => k.toLowerCase() === v.toLowerCase())
    );
    if (!removed.length) continue;
    const usage = (await getTaxonomyUsage(field, removed)).filter((u) => u.total > 0);
    if (usage.length) orphaning.push({ field, usage });
  }

  if (orphaning.length && !confirm) {
    return { needsConfirm: true, orphaning, success: undefined };
  }

  await saveTaxonomy(cleaned);

  await logAudit({
    action: "update",
    entityType: "taxonomy",
    entityLabel: "Content taxonomy",
    before: current as unknown as Record<string, unknown>,
    after: cleaned as unknown as Record<string, unknown>,
  });

  // the submit form and the content form both read this
  revalidatePath("/settings/taxonomy");
  revalidatePath("/content/new");
  revalidatePath("/submit");
  revalidatePath("/submissions/settings");
  return { success: true };
}

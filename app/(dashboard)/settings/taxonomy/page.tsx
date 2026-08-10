import { getTaxonomyAction } from "@/actions/taxonomy.action";
import { getTaxonomyUsage } from "@/services/taxonomy.service";
import { DEFAULT_TAXONOMY, type TaxonomyField } from "@/lib/taxonomy";
import { TaxonomyEditor } from "./taxonomy-editor";

export default async function TaxonomyPage() {
  const taxonomy = (await getTaxonomyAction()) ?? DEFAULT_TAXONOMY;

  // usage is loaded up-front so every value carries its count before anything is edited —
  // knowing what is in use is the whole point of showing this screen
  const fields: TaxonomyField[] = ["departments", "batches", "levels", "noteKinds"];
  const entries = await Promise.all(
    fields.map(async (f) => [f, await getTaxonomyUsage(f, taxonomy[f])] as const)
  );

  return <TaxonomyEditor taxonomy={taxonomy} usage={Object.fromEntries(entries)} />;
}

import { getLevelsAction } from "@/actions/levels.action";
import { getTaxonomy } from "@/services/taxonomy.service";
import { ContentForm } from "./content-form";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  // departments and note kinds come from the shared taxonomy, not a list baked into this form —
  // editing them in Settings has to change this dropdown too
  const [levels, taxonomy, sp] = await Promise.all([
    getLevelsAction(),
    getTaxonomy(),
    searchParams,
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Level, subject, topic and the note itself in one step — each created only if it does not
          already exist.
        </p>
      </div>
      <ContentForm
        levels={levels}
        departments={taxonomy.departments}
        noteKinds={taxonomy.noteKinds}
        batches={taxonomy.batches}
        initialTopicName={sp.topic?.slice(0, 200) ?? ""}
      />
    </div>
  );
}

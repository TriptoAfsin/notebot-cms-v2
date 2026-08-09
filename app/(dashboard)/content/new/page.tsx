import { getLevelsAction } from "@/actions/levels.action";
import { ContentForm } from "./content-form";

export default async function NewContentPage() {
  const levels = await getLevelsAction();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Level, subject, topic and the note itself in one step — each created only if it does not
          already exist.
        </p>
      </div>
      <ContentForm levels={levels} />
    </div>
  );
}

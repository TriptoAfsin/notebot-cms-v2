import { getSyllabusesAction } from "@/actions/syllabuses.action";
import { CreateSyllabusForm } from "./create-form";

export default async function NewSyllabusPage() {
  // existing rows let the form offer the batches/departments already in use, so a new entry
  // lands in the right department instead of creating a near-duplicate slug
  const existing = await getSyllabusesAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Syllabus Entry</h1>
      <CreateSyllabusForm existing={existing} />
    </div>
  );
}

import { getSyllabusesAction, getSyllabusBatchesAction } from "@/actions/syllabuses.action";
import { SyllabusesTable } from "./syllabuses-table";

export default async function SyllabusesPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch } = await searchParams;
  const [syllabuses, batches] = await Promise.all([
    getSyllabusesAction(batch),
    getSyllabusBatchesAction(),
  ]);
  return <SyllabusesTable syllabuses={syllabuses} batches={batches} currentBatch={batch} />;
}

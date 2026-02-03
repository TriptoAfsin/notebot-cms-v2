import { notFound } from "next/navigation";
import { getResultByIdAction } from "@/actions/results";
import { EditResultForm } from "./edit-form";

export default async function EditResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResultByIdAction(parseInt(id));

  if (!result) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Result</h1>
      <EditResultForm result={result} />
    </div>
  );
}

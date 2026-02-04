import { notFound } from "next/navigation";
import { getLevelByIdAction } from "@/actions/levels.action";
import { EditLevelForm } from "./edit-form";

export default async function EditLevelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const level = await getLevelByIdAction(parseInt(id));

  if (!level) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Level</h1>
      <EditLevelForm level={level} />
    </div>
  );
}

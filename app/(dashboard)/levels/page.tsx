import { getLevelsAction } from "@/actions/levels";
import { LevelsTable } from "./levels-table";

export default async function LevelsPage() {
  const levels = await getLevelsAction();
  return <LevelsTable levels={levels} />;
}

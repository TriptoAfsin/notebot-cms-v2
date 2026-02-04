import { getLevelsAction } from "@/actions/levels.action";
import { LevelsTable } from "./levels-table";

export default async function LevelsPage() {
  const levels = await getLevelsAction();
  return <LevelsTable levels={levels} />;
}

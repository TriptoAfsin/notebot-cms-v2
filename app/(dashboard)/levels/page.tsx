import { getLevels } from "@/services/levels";
import { LevelsTable } from "./levels-table";

export default async function LevelsPage() {
  const levels = await getLevels();
  return <LevelsTable levels={levels} />;
}

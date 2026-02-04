import { getRoutinesAction } from "@/actions/routines.action";
import { getLevelsAction } from "@/actions/levels.action";
import { RoutinesTable } from "./routines-table";

export default async function RoutinesPage() {
  const [routines, levels] = await Promise.all([getRoutinesAction(), getLevelsAction()]);
  return <RoutinesTable routines={routines} levels={levels} />;
}

import { getRoutinesAction } from "@/actions/routines";
import { getLevelsAction } from "@/actions/levels";
import { RoutinesTable } from "./routines-table";

export default async function RoutinesPage() {
  const [routines, levels] = await Promise.all([getRoutinesAction(), getLevelsAction()]);
  return <RoutinesTable routines={routines} levels={levels} />;
}

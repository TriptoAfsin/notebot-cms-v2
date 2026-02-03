import { getRoutines } from "@/services/routines";
import { getLevels } from "@/services/levels";
import { RoutinesTable } from "./routines-table";

export default async function RoutinesPage() {
  const [routines, levels] = await Promise.all([getRoutines(), getLevels()]);
  return <RoutinesTable routines={routines} levels={levels} />;
}

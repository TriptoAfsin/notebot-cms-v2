import { getDashboardDataAction } from "@/actions/dashboard.action";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  const data = await getDashboardDataAction();
  return <DashboardView data={data} />;
}

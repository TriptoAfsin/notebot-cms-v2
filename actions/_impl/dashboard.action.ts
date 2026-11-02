// Server-only implementation. Import through actions/dashboard.action.ts (server functions).
import * as dashboardService from "@/services/dashboard.service";

export async function getDashboardDataAction() {
  return dashboardService.getDashboardData();
}

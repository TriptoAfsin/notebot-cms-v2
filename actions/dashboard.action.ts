"use server";

import * as dashboardService from "@/services/dashboard.service";

export async function getDashboardDataAction() {
  return dashboardService.getDashboardData();
}

"use server";

import * as dashboardService from "@/services/dashboard";

export async function getDashboardDataAction() {
  return dashboardService.getDashboardData();
}

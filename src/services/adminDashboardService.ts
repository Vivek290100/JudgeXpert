import { apiRequest } from "@/utils/axios/ApiRequest";
import {
  DashboardStatsApiResponse,
  RevenueStatsApiResponse,
} from "@/types/AdminTypes";
import { ENDPOINTS } from "./api/apiConstants";

export const getDashboardStats = async (): Promise<DashboardStatsApiResponse["data"]> => {
  const response = await apiRequest<DashboardStatsApiResponse>(
    "get",
    ENDPOINTS.ADMIN.DASHBOARD.STATS
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch dashboard stats");
  }

  return response.data;
};

export const getRevenueStats = async (
  period: "monthly" | "yearly"
): Promise<RevenueStatsApiResponse["data"]> => {
  const response = await apiRequest<RevenueStatsApiResponse>(
    "get",
    `${ENDPOINTS.ADMIN.DASHBOARD.REVENUE}?period=${period}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch revenue stats");
  }

  return response.data;
};
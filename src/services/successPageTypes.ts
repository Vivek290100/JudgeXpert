import { apiRequest } from "@/utils/axios/ApiRequest";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse, UserSubscription } from "@/types/successPageTypes";

export const verifyCurrentSubscription = async (): Promise<UserSubscription | null> => {
  const response = await apiRequest<ApiResponse<UserSubscription>>(
    "get",
    ENDPOINTS.SUBSCRIPTION.CURRENT
  );

  if (!response.success) {
    throw new Error(response.message || "No active subscription found");
  }

  return response.data || null;
};
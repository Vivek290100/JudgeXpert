import { apiRequest } from "@/utils/axios/ApiRequest";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse, CheckoutResponse, UserSubscription } from "@/types/subscriptionPageTypes";

export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  const response = await apiRequest<ApiResponse<UserSubscription>>(
    "get",
    ENDPOINTS.SUBSCRIPTION.CURRENT
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch subscription status");
  }

  return response.data || null;
};

export const createCheckoutSession = async (planId: string): Promise<CheckoutResponse> => {
  const response = await apiRequest<ApiResponse<CheckoutResponse>>(
    "post",
    ENDPOINTS.SUBSCRIPTION.CHECKOUT,
    { planId }
  );

  if (!response.success || !response.data?.checkoutUrl) {
    throw new Error(response.message || "Failed to create checkout session");
  }

  return response.data;
};
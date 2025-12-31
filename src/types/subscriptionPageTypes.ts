export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  popular?: boolean;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface UserSubscription {
  planId: string;
  price: number; // Price in paise
  status: string;
  currentPeriodEnd: string;
}
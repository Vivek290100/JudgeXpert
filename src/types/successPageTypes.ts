export interface UserSubscription {
  planId: string;
  price: number;
  status: string;
  currentPeriodEnd: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
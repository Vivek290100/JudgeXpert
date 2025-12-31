import { apiRequest } from "@/utils/axios/ApiRequest";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse } from "@/types/ProblemTypes";
import { LeaderboardApiResponse } from "@/types/LeaderboardTypes";

export const getLeaderboard = async (page: number = 1, limit: number = 10) => {
  const response = await apiRequest<ApiResponse<LeaderboardApiResponse>>(
    "get",
    ENDPOINTS.LEADERBOARD.LIST(page, limit)
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to load leaderboard");
  }

  return response.data;
};
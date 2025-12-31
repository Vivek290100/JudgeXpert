import { apiRequest } from "@/utils/axios/ApiRequest";
import { ApiResponse } from "@/types/ProblemTypes";
import { ENDPOINTS } from "./api/apiConstants";
import { Contest } from "@/types/ContestResultsTypes";

export const getContestDetail = async (contestId: string) => {
  const response = await apiRequest<ApiResponse<{ contest: any }>>(
    "get",
    ENDPOINTS.CONTEST.DETAIL(contestId)
  );
  return response.data?.contest;
};

export const getMyRegisteredContests = async (): Promise<string[]> => {
  const response = await apiRequest<ApiResponse<{ contestIds: string[] }>>(
    "get",
    ENDPOINTS.CONTEST.REGISTERED
  );
  return response.data?.contestIds || [];
};

export const getContestResults = async (contestId: string) => {
  const response = await apiRequest<{ success: boolean; data: { contest: Contest } }>(
    "get",
    ENDPOINTS.CONTEST.DETAIL(contestId)
  );
  return response.data?.contest;
};





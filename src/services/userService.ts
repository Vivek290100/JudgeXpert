import { apiRequest } from "@/utils/axios/ApiRequest";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse, ProblemsResponse } from "@/types/ProblemTypes";

export const getUserProblemStats = async () => {
  const response = await apiRequest<ApiResponse<ProblemsResponse>>(
    "get",
    `${ENDPOINTS.PROBLEM.LIST}?page=1&limit=1000`
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to load user stats");
  }

  return {
    problems: response.data.problems || [],
    userProblemStatus: response.data.userProblemStatus || [],
    totalProblemsInDb: response.data.totalProblemsInDb || 0,
  };
};
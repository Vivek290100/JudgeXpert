import { apiRequest } from "@/utils/axios/ApiRequest";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse, ProblemsResponse } from "@/types/ProblemTypes";

export const getProblems = async (
  page: number = 1,
  limit: number = 10,
  filters: { difficulty?: string; status?: string } = {},
  search: string = ""
) => {
  let url = `${ENDPOINTS.PROBLEM.LIST}?page=${page}&limit=${limit}`;

  if (filters.difficulty) url += `&difficulty=${filters.difficulty}`;
  if (filters.status) {
    if (filters.status === "SOLVED") url += "&solved=true";
    else if (filters.status === "NOT_SOLVED") url += "&solved=false";
    else if (filters.status === "PREMIUM") url += "&status=premium";
    else if (filters.status === "FREE") url += "&status=free";
  }
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await apiRequest<ApiResponse<ProblemsResponse>>("get", url);

  if (!response.success) {
    throw new Error(response.message || "Failed to load problems");
  }

  return {
    problems: response.data.problems || [],
    userProblemStatus: response.data.userProblemStatus || [],
    totalPages: response.data.totalPages || 1,
    currentPage: response.data.currentPage || 1,
    totalProblemsInDb: response.data.totalProblemsInDb || 0,
  };
};
import { apiRequest } from "@/utils/axios/ApiRequest";
import { ApiResponse, IProblem, ProblemApiResponse, ProblemsResponse } from "@/types/ProblemTypes";
import { ENDPOINTS } from "./api/apiConstants";

export const getAdminProblems = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  let url = `${ENDPOINTS.ADMIN.PROBLEM.LIST}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await apiRequest<ApiResponse<ProblemsResponse>>("get", url);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch problems");
  }

  return {
    problems: response.data.problems || [],
    totalPages: response.data.totalPages || 1,
    currentPage: response.data.currentPage || 1,
  };
};

export const getProblemById = async (problemId: string): Promise<IProblem | null> => {
  const response = await apiRequest<ProblemApiResponse>(
    "get",
    ENDPOINTS.ADMIN.PROBLEM.DETAIL(problemId)
  );

  if (!response.success || !response.data?.problem) {
    throw new Error(response.message || "Failed to load problem details");
  }

  return response.data.problem;
};

export const updateProblemDifficulty = async (problemId: string, difficulty: string) => {
  const response = await apiRequest<ProblemApiResponse>(
    "patch",
    ENDPOINTS.ADMIN.PROBLEM.UPDATE_DIFFICULTY(problemId),
    { difficulty }
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to update difficulty");
  }

  return response.data.problem;
};

export const updateProblemStatus = async (problemId: string, status: string) => {
  const response = await apiRequest<ProblemApiResponse>(
    "patch",
    ENDPOINTS.ADMIN.PROBLEM.UPDATE_STATUS(problemId),
    { status }
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to update status");
  }

  return response.data.problem;
};

export const toggleProblemBlock = async (problemId: string, shouldBlock: boolean) => {
  const endpoint = shouldBlock
    ? ENDPOINTS.ADMIN.PROBLEM.BLOCK(problemId)
    : ENDPOINTS.ADMIN.PROBLEM.UNBLOCK(problemId);

  const response = await apiRequest<ProblemApiResponse>("patch", endpoint, {});

  if (!response.success) {
    throw new Error(response.message || `Failed to ${shouldBlock ? "block" : "unblock"} problem`);
  }

  return response.data.problem;
};
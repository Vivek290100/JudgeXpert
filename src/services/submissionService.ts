import { apiRequest } from "@/utils/axios/ApiRequest";
import { ApiResponse } from "@/types/ProblemTypes"; 
import { ENDPOINTS } from "./api/apiConstants";
import { Submission } from "@/types/SubmissionsPageTypes";

export const getUserSubmissions = async (params: {
  problemSlug?: string;
  contestId?: string;
}) => {
  const query = new URLSearchParams();
  if (params.problemSlug) query.append("problemSlug", params.problemSlug);
  if (params.contestId) query.append("contestId", params.contestId);

  const url = `${ENDPOINTS.SUBMISSION.LIST}${query.toString() ? `?${query.toString()}` : ""}`;

  const response = await apiRequest<
    ApiResponse<{ submissions: Submission[] }>
  >("get", url);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch submissions");
  }

  return response.data?.submissions || [];
};
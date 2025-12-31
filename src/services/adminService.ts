import { apiRequest } from "@/utils/axios/ApiRequest";
import { AdminUsersResponse, AdminUser } from "@/types/AdminTypes";
import { ENDPOINTS } from "./api/apiConstants";
import { ApiResponse } from "@/types/ProblemTypes";

export const getUsers = async (page: number = 1, limit: number = 10, search: string = "") => {
  let url = `${ENDPOINTS.ADMIN.USERS.LIST}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await apiRequest<ApiResponse<AdminUsersResponse>>("get", url);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch users");
  }

  return response.data || {
    users: [],
    totalPages: 1,
  };
};

export const toggleUserBlockStatus = async (userId: string, shouldBlock: boolean) => {
  const endpoint = shouldBlock
    ? ENDPOINTS.ADMIN.USERS.BLOCK(userId)
    : ENDPOINTS.ADMIN.USERS.UNBLOCK(userId);

  const response = await apiRequest<ApiResponse<AdminUser>>("post", endpoint);

  if (!response.success) {
    throw new Error(response.message || `Failed to ${shouldBlock ? "block" : "unblock"} user`);
  }

  return response.data;
};
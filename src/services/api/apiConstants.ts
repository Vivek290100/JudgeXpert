export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const ENDPOINTS = {
  CONTEST: {
    DETAIL: (contestId: string) => `/contests/${contestId}`,
    REGISTERED: "/registered-contests",
    
  },
  LEADERBOARD: {
    LIST: (page: number, limit: number) => `/leaderboard?page=${page}&limit=${limit}`,
  },
  PROBLEM: {
    LIST: "/problems",
  },
  SUBSCRIPTION: {
    CURRENT: "/subscriptions/current",
    CHECKOUT: "/subscriptions/checkout",

  },
  SUBMISSION: {
    LIST: "/submissions",
  },

  ADMIN: {
    USERS: {
      LIST: "/admin/users",
      BLOCK: (userId: string) => `/admin/users/${userId}/block`,
      UNBLOCK: (userId: string) => `/admin/users/${userId}/unblock`,
    },
    PROBLEM: {
      LIST: "/admin/problems",
      DETAIL: (id: string) => `/admin/problems/${id}`,
      UPDATE_DIFFICULTY: (id: string) => `/admin/problems/${id}`,
      UPDATE_STATUS: (id: string) => `/admin/problems/${id}/status`,
      BLOCK: (id: string) => `/admin/problems/${id}/block`,
      UNBLOCK: (id: string) => `/admin/problems/${id}/unblock`,
    },
    DASHBOARD: {
      STATS: "/admin/dashboard-stats",
      REVENUE: "/admin/revenue-stats",
    },
  },
} as const;
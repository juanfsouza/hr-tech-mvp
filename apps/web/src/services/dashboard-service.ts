import { api } from "@/lib/api";

export interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  avgMatch: number;
  testsCompleted: number;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    createdAt: string;
  }>;
}

export interface Notification {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export const dashboardService = {
  async getStats() {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  async getNotifications() {
    const { data } = await api.get<Notification[]>("/dashboard/notifications");
    return data;
  },
};

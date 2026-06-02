"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DailyRevenue {
  date: string;
  revenueIDR: number;
}

export interface RecentAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  scheduledAt: string;
  status: string;
  type: string;
}

export interface DashboardSummary {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  totalRevenueIDR: number;
  weekRevenue: DailyRevenue[];
  recentAppointments: RecentAppointment[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () =>
      apiClient
        .get<ApiResponse<DashboardSummary>>("/analytics/summary")
        .then((r) => r.data.data),
    staleTime: 60_000,
  });
}

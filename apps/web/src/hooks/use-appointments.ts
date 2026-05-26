"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  AppointmentItem,
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
  PaginatedResult,
} from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AppointmentQuery {
  doctorId?: string;
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useAppointments(params?: AppointmentQuery) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<AppointmentItem>>>("/appointments", { params })
        .then((r) => r.data.data),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () =>
      apiClient
        .get<ApiResponse<AppointmentItem>>(`/appointments/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) =>
      apiClient
        .post<ApiResponse<AppointmentItem>>("/appointments", dto)
        .then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointmentStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAppointmentStatusDto) =>
      apiClient
        .patch<ApiResponse<AppointmentItem>>(`/appointments/${id}/status`, dto)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments", id] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

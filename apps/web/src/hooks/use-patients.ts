"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PatientProfile, CreatePatientDto, UpdatePatientDto, PaginatedResult } from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function usePatients(params?: { search?: string; tags?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<PatientProfile>>>("/patients", { params })
        .then((r) => r.data.data),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () =>
      apiClient.get<ApiResponse<PatientProfile>>(`/patients/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function usePatientTimeline(id: string) {
  return useQuery({
    queryKey: ["patients", id, "timeline"],
    queryFn: () =>
      apiClient.get<ApiResponse<unknown[]>>(`/patients/${id}/timeline`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePatientDto) =>
      apiClient.post<ApiResponse<PatientProfile>>("/patients", dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePatientDto) =>
      apiClient.patch<ApiResponse<PatientProfile>>(`/patients/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients", id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

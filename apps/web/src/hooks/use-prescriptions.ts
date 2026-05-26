"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PrescriptionRecord, CreatePrescriptionDto, PaginatedResult } from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function usePrescriptions(params?: { patientId?: string; doctorId?: string; page?: number }) {
  return useQuery({
    queryKey: ["prescriptions", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<PrescriptionRecord>>>("/prescriptions", { params })
        .then((r) => r.data.data),
  });
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: ["prescriptions", id],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PrescriptionRecord>>(`/prescriptions/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });
}

export function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: ["prescriptions", "patient", patientId],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PrescriptionRecord[]>>(`/prescriptions/patient/${patientId}`)
        .then((r) => r.data.data),
    enabled: !!patientId,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePrescriptionDto) =>
      apiClient
        .post<ApiResponse<PrescriptionRecord>>("/prescriptions", dto)
        .then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}

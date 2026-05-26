"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DoctorProfile, UpdateDoctorDto, DoctorAvailabilityDto, DoctorUnavailabilityDto, TimeSlot } from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: () =>
      apiClient.get<ApiResponse<DoctorProfile[]>>("/doctors").then((r) => r.data.data),
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: () =>
      apiClient.get<ApiResponse<DoctorProfile>>(`/doctors/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDoctorSlots(id: string, date: string) {
  return useQuery({
    queryKey: ["doctors", id, "slots", date],
    queryFn: () =>
      apiClient
        .get<ApiResponse<TimeSlot[]>>(`/doctors/${id}/slots`, { params: { date } })
        .then((r) => r.data.data),
    enabled: !!id && !!date,
  });
}

export function useUpdateDoctor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDoctorDto) =>
      apiClient.patch<ApiResponse<DoctorProfile>>(`/doctors/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", id] }),
  });
}

export function useSetDoctorAvailability(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: DoctorAvailabilityDto[]) =>
      apiClient.post(`/doctors/${id}/availability`, slots),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", id] }),
  });
}

export function useAddUnavailability(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: DoctorUnavailabilityDto) =>
      apiClient.post(`/doctors/${id}/unavailability`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", id] }),
  });
}

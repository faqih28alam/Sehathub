"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ServiceItem, CreateServiceDto, UpdateServiceDto } from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useServices(onlyActive = false) {
  return useQuery({
    queryKey: ["services", { onlyActive }],
    queryFn: () =>
      apiClient
        .get<ApiResponse<ServiceItem[]>>("/services", {
          params: onlyActive ? { active: "true" } : undefined,
        })
        .then((r) => r.data.data),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateServiceDto) =>
      apiClient.post<ApiResponse<ServiceItem>>("/services", dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateServiceDto) =>
      apiClient.patch<ApiResponse<ServiceItem>>(`/services/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

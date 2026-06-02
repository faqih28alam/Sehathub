"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PaymentItem, RecordManualPaymentDto, PaginatedResult } from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaymentsQuery {
  patientId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function usePayments(params?: PaymentsQuery) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<PaymentItem>>>("/payments", { params })
        .then((r) => r.data.data),
  });
}

export function useRecordManualPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RecordManualPaymentDto) =>
      apiClient
        .post<ApiResponse<PaymentItem>>("/payments/manual", dto)
        .then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

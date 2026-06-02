"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface WhatsAppMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  to?: string | null;
  from?: string | null;
  body: string;
  type: string;
  templateName?: string | null;
  status: string;
  waMessageId?: string | null;
  appointmentId?: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useWhatsAppMessages(params?: {
  direction?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["whatsapp", "messages", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<WhatsAppMessage>>>("/whatsapp/messages", { params })
        .then((r) => r.data.data),
  });
}

export function useSendWhatsApp() {
  return useMutation({
    mutationFn: (dto: { to: string; body: string }) =>
      apiClient
        .post<ApiResponse<{ id: string }>>("/whatsapp/send", dto)
        .then((r) => r.data.data),
  });
}

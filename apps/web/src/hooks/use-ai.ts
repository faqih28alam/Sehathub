"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TriageResult {
  urgency: "emergency" | "urgent" | "routine" | "self-care";
  summary: string;
  recommendations: string[];
  seekEmergencyIf: string[];
  _stub?: boolean;
}

export interface FaqAnswer {
  answer: string;
  sources: number[];
  _stub?: boolean;
}

export interface ConsultationSummary {
  summary: string;
  keyFindings: string[];
  followUp: string[];
  _stub?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export function useTriage() {
  return useMutation({
    mutationFn: (dto: { symptoms: string; language?: string }) =>
      apiClient
        .post<ApiResponse<TriageResult>>("/ai/triage", dto)
        .then((r) => r.data.data),
  });
}

export function useFaqQuery() {
  return useMutation({
    mutationFn: (question: string) =>
      apiClient
        .post<ApiResponse<FaqAnswer>>("/ai/faq/query", { question })
        .then((r) => r.data.data),
  });
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: (appointmentId: string) =>
      apiClient
        .post<ApiResponse<ConsultationSummary>>(`/ai/summary/${appointmentId}`)
        .then((r) => r.data.data),
  });
}

export function useFaqItems() {
  return useQuery({
    queryKey: ["ai", "faq"],
    queryFn: () =>
      apiClient.get<ApiResponse<FaqItem[]>>("/ai/faq").then((r) => r.data.data),
  });
}

export function useCreateFaqItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { question: string; answer: string; category?: string }) =>
      apiClient.post<ApiResponse<FaqItem>>("/ai/faq", dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai", "faq"] }),
  });
}

export function useDeleteFaqItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/ai/faq/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai", "faq"] }),
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
export type LeadSource =
  | "WALK_IN"
  | "WHATSAPP"
  | "WEBSITE"
  | "REFERRAL"
  | "SOCIAL_MEDIA"
  | "OTHER";

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes?: string | null;
  assignedToId?: string | null;
  activityCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrmActivity {
  id: string;
  leadId: string;
  actorId: string;
  type: string;
  notes: string;
  createdAt: string;
}

export interface LeadDetail extends Lead {
  activities: CrmActivity[];
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

export function useLeads(params?: {
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["crm", "leads", params],
    queryFn: () =>
      apiClient
        .get<ApiResponse<PaginatedResult<Lead>>>("/crm/leads", { params })
        .then((r) => r.data.data),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["crm", "leads", id],
    queryFn: () =>
      apiClient
        .get<ApiResponse<LeadDetail>>(`/crm/leads/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useLeadCounts() {
  return useQuery({
    queryKey: ["crm", "counts"],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Record<string, number>>>("/crm/leads/counts")
        .then((r) => r.data.data),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      name: string;
      email?: string;
      phone?: string;
      source?: LeadSource;
      notes?: string;
    }) =>
      apiClient.post<ApiResponse<Lead>>("/crm/leads", dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm"] });
    },
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<Lead>) =>
      apiClient.patch<ApiResponse<Lead>>(`/crm/leads/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm"] });
    },
  });
}

export function useAddActivity(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { type: string; notes: string }) =>
      apiClient
        .post<ApiResponse<CrmActivity>>(`/crm/leads/${leadId}/activities`, dto)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "leads", leadId] });
    },
  });
}

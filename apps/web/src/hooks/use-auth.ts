"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthTokens,
  AuthUser,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AcceptInviteDto,
} from "@sehathub/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

function roleDashboard(role: string) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin";
  if (role === "DOCTOR") return "/doctor";
  return "/patient";
}

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (dto: LoginDto) =>
      apiClient.post<ApiResponse<LoginResponse>>("/auth/login", dto).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      Cookies.set("access_token", data.accessToken, { expires: 1 / 96 });
      router.push(roleDashboard(data.user.role));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (dto: RegisterDto) =>
      apiClient.post<ApiResponse<LoginResponse>>("/auth/register", dto).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      Cookies.set("access_token", data.accessToken, { expires: 1 / 96 });
      router.push(roleDashboard(data.user.role));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSettled: () => {
      clearAuth();
      Cookies.remove("access_token");
      queryClient.clear();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) =>
      apiClient.post("/auth/forgot-password", dto),
  });
}

export function useResetPassword(token: string) {
  const router = useRouter();
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) =>
      apiClient.post(`/auth/reset-password/${token}`, dto),
    onSuccess: () => router.push("/login"),
  });
}

export function useAcceptInvite(token: string) {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (dto: AcceptInviteDto) =>
      apiClient
        .post<ApiResponse<LoginResponse>>(`/auth/accept-invite/${token}`, dto)
        .then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      Cookies.set("access_token", data.accessToken, { expires: 1 / 96 });
      router.push(roleDashboard(data.user.role));
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      apiClient.get<ApiResponse<AuthUser>>("/auth/me").then((r) => r.data.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

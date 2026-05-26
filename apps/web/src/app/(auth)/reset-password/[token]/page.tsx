"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { ErrorAlert } from "@/components/auth/error-alert";
import { useResetPassword } from "@/hooks/use-auth";

const schema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const { mutate: reset, isPending, error } = useResetPassword(params.token);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const errorMessage =
    error && (error as { response?: { data?: { error?: string } } }).response?.data?.error;

  return (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-10">
      <h2 className="text-[22px] font-bold text-neutral-dark mb-6">Reset Password</h2>

      {errorMessage && (
        <div className="mb-4">
          <ErrorAlert
            message={typeof errorMessage === "string" ? errorMessage : "Gagal reset password"}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(({ password }) => reset({ password }))}
        className="flex flex-col gap-4"
      >
        <FormField label="Password Baru" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            {...register("password")}
            error={!!errors.password}
          />
        </FormField>

        <FormField
          label="Konfirmasi Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
          />
        </FormField>

        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? "Memproses..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

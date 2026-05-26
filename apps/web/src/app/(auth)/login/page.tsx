"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { ErrorAlert } from "@/components/auth/error-alert";
import { useLogin } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const errorMessage =
    error && (error as { response?: { data?: { error?: string } } }).response?.data?.error;

  return (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-10">
      <h2 className="text-[22px] font-bold text-neutral-dark mb-6">Masuk</h2>

      {errorMessage && (
        <div className="mb-4">
          <ErrorAlert message={typeof errorMessage === "string" ? errorMessage : "Login gagal"} />
        </div>
      )}

      <form onSubmit={handleSubmit((d) => login(d))} className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} error={!!errors.email} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            {...register("password")}
            error={!!errors.password}
          />
        </FormField>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-[14px] text-brand-pink hover:text-brand-pink-hover"
          >
            Lupa password?
          </Link>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-neutral-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="text-brand-pink font-bold hover:text-brand-pink-hover">
          Daftar
        </Link>
      </p>
    </div>
  );
}

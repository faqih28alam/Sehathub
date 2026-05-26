"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { ErrorAlert } from "@/components/auth/error-alert";
import { useRegister } from "@/hooks/use-auth";

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { mutate: register_, isPending, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const errorMessage =
    error && (error as { response?: { data?: { error?: string } } }).response?.data?.error;

  return (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-10">
      <h2 className="text-[22px] font-bold text-neutral-dark mb-6">Daftar Akun</h2>

      {errorMessage && (
        <div className="mb-4">
          <ErrorAlert
            message={typeof errorMessage === "string" ? errorMessage : "Pendaftaran gagal"}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(({ name, email, password }) => register_({ name, email, password }))}
        className="flex flex-col gap-4"
      >
        <FormField label="Nama Lengkap" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} error={!!errors.name} />
        </FormField>

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
          {isPending ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-neutral-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-brand-pink font-bold hover:text-brand-pink-hover">
          Masuk
        </Link>
      </p>
    </div>
  );
}

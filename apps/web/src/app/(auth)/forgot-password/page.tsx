"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { useForgotPassword } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgot, isPending } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (submitted) {
    return (
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-10 text-center">
        <div className="text-[48px] mb-4">✉️</div>
        <h2 className="text-[22px] font-bold text-neutral-dark mb-2">Cek Email Anda</h2>
        <p className="text-[14px] text-neutral-muted mb-6">
          Jika email terdaftar, kami telah mengirimkan tautan reset password.
        </p>
        <Link href="/login" className="text-brand-pink font-bold hover:text-brand-pink-hover text-[14px]">
          Kembali ke halaman login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-10">
      <h2 className="text-[22px] font-bold text-neutral-dark mb-2">Lupa Password</h2>
      <p className="text-[14px] text-neutral-muted mb-6">
        Masukkan email Anda dan kami akan mengirimkan tautan reset password.
      </p>

      <form
        onSubmit={handleSubmit((d) => forgot(d, { onSuccess: () => setSubmitted(true) }))}
        className="flex flex-col gap-4"
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} error={!!errors.email} />
        </FormField>

        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? "Mengirim..." : "Kirim Tautan Reset"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-neutral-muted">
        <Link href="/login" className="text-brand-pink font-bold hover:text-brand-pink-hover">
          Kembali ke login
        </Link>
      </p>
    </div>
  );
}

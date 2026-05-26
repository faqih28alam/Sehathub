"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreatePrescription } from "@/hooks/use-prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/auth/error-alert";
import type { PrescriptionItemDto } from "@sehathub/types";

function emptyItem(): PrescriptionItemDto {
  return { medication: "", dosage: "", frequency: "", duration: "", notes: "" };
}

function NewPrescriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") ?? "";

  const { mutate: create, isPending, error } = useCreatePrescription();

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItemDto[]>([emptyItem()]);

  const updateItem = (idx: number, field: keyof PrescriptionItemDto, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.medication && i.dosage && i.frequency && i.duration);
    if (!validItems.length || !appointmentId) return;
    create(
      { appointmentId, notes: notes || undefined, items: validItems },
      { onSuccess: () => router.push("/doctor/prescriptions") }
    );
  };

  const errorMessage =
    error && (error as { response?: { data?: { error?: string } } }).response?.data?.error;

  return (
    <div className="max-w-[700px]">
      <h2 className="text-[24px] font-bold text-neutral-dark mb-6">Buat Resep</h2>

      {errorMessage && (
        <div className="mb-4">
          <ErrorAlert message={typeof errorMessage === "string" ? errorMessage : "Gagal membuat resep"} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
          <Label htmlFor="notes" className="mb-2 block">Catatan Dokter (opsional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instruksi khusus, alergi yang perlu diperhatikan, dll."
            rows={3}
            className="w-full border border-neutral-border rounded-btn px-3 py-2 text-[14px] text-neutral-dark outline-none focus:border-brand-pink focus:shadow-focus-pink resize-none"
          />
        </div>

        <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-dark text-[16px]">Daftar Obat</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              + Tambah Obat
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="border border-neutral-border rounded p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold text-neutral-dark">Obat #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[12px] text-brand-pink hover:text-brand-pink-hover"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`med-${idx}`} className="mb-1 block text-[13px]">Nama Obat *</Label>
                    <Input
                      id={`med-${idx}`}
                      value={item.medication}
                      onChange={(e) => updateItem(idx, "medication", e.target.value)}
                      placeholder="Amoxicillin"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dos-${idx}`} className="mb-1 block text-[13px]">Dosis *</Label>
                    <Input
                      id={`dos-${idx}`}
                      value={item.dosage}
                      onChange={(e) => updateItem(idx, "dosage", e.target.value)}
                      placeholder="500mg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`freq-${idx}`} className="mb-1 block text-[13px]">Frekuensi *</Label>
                    <Input
                      id={`freq-${idx}`}
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, "frequency", e.target.value)}
                      placeholder="3x sehari"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dur-${idx}`} className="mb-1 block text-[13px]">Durasi *</Label>
                    <Input
                      id={`dur-${idx}`}
                      value={item.duration}
                      onChange={(e) => updateItem(idx, "duration", e.target.value)}
                      placeholder="5 hari"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`note-${idx}`} className="mb-1 block text-[13px]">Catatan (opsional)</Label>
                    <Input
                      id={`note-${idx}`}
                      value={item.notes ?? ""}
                      onChange={(e) => updateItem(idx, "notes", e.target.value)}
                      placeholder="Diminum setelah makan"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending || !appointmentId}>
            {isPending ? "Menyimpan..." : "Simpan Resep & Cetak PDF"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<div className="text-neutral-muted">Memuat...</div>}>
      <NewPrescriptionForm />
    </Suspense>
  );
}

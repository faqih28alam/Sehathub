"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { useGenerateSummary, type ConsultationSummary } from "@/hooks/use-ai";
import type { AppointmentItem } from "@sehathub/types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  IN_PROGRESS: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  NO_SHOW: "Tidak Hadir",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-neutral-muted",
  NO_SHOW: "bg-red-100 text-red-700",
};

function SummaryPanel({ appointmentId }: { appointmentId: string }) {
  const { mutateAsync: generateSummary, isPending } = useGenerateSummary();
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handle() {
    setOpen(true);
    setError("");
    setSummary(null);
    try {
      const result = await generateSummary(appointmentId);
      setSummary(result);
    } catch {
      setError("Gagal membuat ringkasan.");
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-border">
      <button
        onClick={handle}
        disabled={isPending}
        className="text-[13px] font-bold text-brand-pink hover:text-brand-pink-hover disabled:opacity-60"
      >
        {isPending ? "Membuat ringkasan AI..." : "Buat Ringkasan AI"}
      </button>

      {error && <p className="text-[12px] text-brand-pink mt-2">{error}</p>}

      {open && summary && (
        <div className="mt-3 space-y-3">
          {summary._stub && (
            <p className="text-[12px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
              Mode demo — API key AI belum dikonfigurasi.
            </p>
          )}
          <div>
            <p className="text-[12px] font-bold text-neutral-dark">Ringkasan</p>
            <p className="text-[13px] text-neutral-muted mt-0.5">{summary.summary}</p>
          </div>
          {summary.keyFindings.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-neutral-dark">Temuan Utama</p>
              <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                {summary.keyFindings.map((f, i) => (
                  <li key={i} className="text-[13px] text-neutral-muted">{f}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.followUp.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-neutral-dark">Tindak Lanjut</p>
              <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                {summary.followUp.map((f, i) => (
                  <li key={i} className="text-[13px] text-neutral-muted">{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ appt }: { appt: AppointmentItem }) {
  const { mutateAsync: updateStatus, isPending } = useUpdateAppointmentStatus(appt.id);
  const [notes, setNotes] = useState(appt.consultationNotes ?? "");

  async function startConsult() {
    await updateStatus({ status: "IN_PROGRESS" }).catch(() => null);
  }

  async function complete() {
    await updateStatus({ status: "COMPLETED", consultationNotes: notes || undefined }).catch(() => null);
  }

  return (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[16px] font-bold text-neutral-dark">{appt.patientName}</p>
          <p className="text-[13px] text-neutral-muted mt-0.5">
            {format(new Date(appt.scheduledAt), "EEEE, d MMM — HH:mm", { locale: idLocale })}
            {" "}s/d {format(new Date(appt.endsAt), "HH:mm")}
          </p>
          <p className="text-[13px] text-neutral-muted">{appt.serviceName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[appt.status] ?? ""}`}>
            {STATUS_LABEL[appt.status] ?? appt.status}
          </span>
          <span className="text-[12px] text-neutral-muted">
            {appt.type === "IN_PERSON" ? "Tatap Muka" : "Telekonsula"}
          </span>
        </div>
      </div>

      {appt.status === "CONFIRMED" && (
        <div className="mt-4 pt-4 border-t border-neutral-border">
          <button
            onClick={startConsult}
            disabled={isPending}
            className="bg-purple-500 text-white h-[36px] px-4 rounded-btn text-[13px] font-bold hover:bg-purple-600 disabled:opacity-60"
          >
            Mulai Konsultasi
          </button>
        </div>
      )}

      {appt.status === "IN_PROGRESS" && (
        <div className="mt-4 pt-4 border-t border-neutral-border space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Catatan konsultasi..."
            className="w-full border border-neutral-border rounded-[4px] px-3 py-2 text-[14px] text-neutral-dark placeholder:text-neutral-muted focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)] resize-none"
          />
          <button
            onClick={complete}
            disabled={isPending}
            className="bg-green-500 text-white h-[36px] px-4 rounded-btn text-[13px] font-bold hover:bg-green-600 disabled:opacity-60"
          >
            Selesaikan Konsultasi
          </button>
        </div>
      )}

      {appt.status === "COMPLETED" && (
        <SummaryPanel appointmentId={appt.id} />
      )}

      {appt.consultationNotes && appt.status === "COMPLETED" && (
        <div className="mt-3">
          <p className="text-[12px] font-bold text-neutral-dark">Catatan</p>
          <p className="text-[13px] text-neutral-muted mt-0.5">{appt.consultationNotes}</p>
        </div>
      )}
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const [tab, setTab] = useState<"today" | "upcoming" | "completed">("today");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

  const params =
    tab === "today"
      ? { dateFrom: todayStr, dateTo: tomorrowStr, limit: 50 }
      : tab === "upcoming"
      ? { status: "CONFIRMED" as never, limit: 50 }
      : { status: "COMPLETED" as never, limit: 50 };

  const { data, isLoading } = useAppointments(params);

  const TABS = [
    { key: "today", label: "Hari Ini" },
    { key: "upcoming", label: "Akan Datang" },
    { key: "completed", label: "Selesai" },
  ] as const;

  return (
    <div>
      <h2 className="text-[24px] font-bold text-neutral-dark mb-6">Janji Temu Saya</h2>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[13px] px-4 py-2 rounded-full font-medium transition-colors ${
              tab === t.key
                ? "bg-brand-pink text-white"
                : "bg-white border border-neutral-border text-neutral-muted hover:border-brand-pink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-neutral-muted text-[14px]">Memuat...</p>
      )}

      {!isLoading && data?.data.length === 0 && (
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-8 text-center">
          <p className="text-neutral-muted text-[14px]">Tidak ada janji temu.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {data?.data.map((a) => (
          <AppointmentRow key={a.id} appt={a} />
        ))}
      </div>
    </div>
  );
}

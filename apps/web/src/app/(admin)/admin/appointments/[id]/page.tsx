"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAppointment, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { useGenerateSummary, type ConsultationSummary } from "@/hooks/use-ai";

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

const TRANSITIONS: Record<string, { status: string; label: string; color: string }[]> = {
  PENDING: [
    { status: "CONFIRMED", label: "Konfirmasi", color: "bg-blue-500 text-white hover:bg-blue-600" },
    { status: "CANCELLED", label: "Batalkan", color: "bg-gray-200 text-neutral-dark hover:bg-gray-300" },
  ],
  CONFIRMED: [
    { status: "IN_PROGRESS", label: "Mulai Konsultasi", color: "bg-purple-500 text-white hover:bg-purple-600" },
    { status: "NO_SHOW", label: "Tidak Hadir", color: "bg-orange-500 text-white hover:bg-orange-600" },
    { status: "CANCELLED", label: "Batalkan", color: "bg-gray-200 text-neutral-dark hover:bg-gray-300" },
  ],
  IN_PROGRESS: [
    { status: "COMPLETED", label: "Selesaikan", color: "bg-green-500 text-white hover:bg-green-600" },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: appt, isLoading } = useAppointment(id);
  const { mutateAsync: updateStatus, isPending: updating } = useUpdateAppointmentStatus(id);
  const { mutateAsync: generateSummary, isPending: generating } = useGenerateSummary();

  const [notes, setNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");

  if (isLoading) {
    return <div className="text-neutral-muted text-[14px]">Memuat...</div>;
  }
  if (!appt) {
    return <div className="text-neutral-muted text-[14px]">Janji temu tidak ditemukan.</div>;
  }

  const transitions = TRANSITIONS[appt.status] ?? [];

  async function handleTransition(status: string) {
    if (status === "CANCELLED") {
      setPendingStatus(status);
      setShowCancelModal(true);
      return;
    }
    try {
      await updateStatus({ status: status as never, consultationNotes: notes || undefined });
    } catch {
      // error visible via react-query
    }
  }

  async function confirmCancel() {
    try {
      await updateStatus({ status: "CANCELLED", cancellationReason: cancelReason || undefined });
      setShowCancelModal(false);
    } catch {
      // error visible via react-query
    }
  }

  async function handleGenerateSummary() {
    setSummaryError("");
    setSummary(null);
    try {
      const result = await generateSummary(id);
      setSummary(result);
    } catch {
      setSummaryError("Gagal membuat ringkasan. Coba lagi.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/appointments"
          className="text-neutral-muted hover:text-neutral-dark text-[14px]"
        >
          ← Janji Temu
        </Link>
        <span className="text-neutral-border">/</span>
        <span className="text-[14px] text-neutral-dark font-medium">Detail</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-neutral-dark">
            Janji Temu — {appt.patientName}
          </h2>
          <p className="text-neutral-muted text-[14px] mt-1">
            {format(new Date(appt.scheduledAt), "EEEE, d MMMM yyyy — HH:mm", { locale: idLocale })}
          </p>
        </div>
        <span
          className={`text-[13px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[appt.status] ?? ""}`}
        >
          {STATUS_LABEL[appt.status] ?? appt.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Info + Actions */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Appointment info */}
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Informasi Janji</h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-[14px]">
              <div>
                <dt className="font-bold text-neutral-dark">Pasien</dt>
                <dd className="text-neutral-muted mt-0.5">{appt.patientName}</dd>
              </div>
              <div>
                <dt className="font-bold text-neutral-dark">Dokter</dt>
                <dd className="text-neutral-muted mt-0.5">{appt.doctorName}</dd>
              </div>
              <div>
                <dt className="font-bold text-neutral-dark">Layanan</dt>
                <dd className="text-neutral-muted mt-0.5">{appt.serviceName}</dd>
              </div>
              <div>
                <dt className="font-bold text-neutral-dark">Tipe</dt>
                <dd className="text-neutral-muted mt-0.5">
                  {appt.type === "IN_PERSON" ? "Tatap Muka" : "Telekonsula"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-neutral-dark">Mulai</dt>
                <dd className="text-neutral-muted mt-0.5">
                  {format(new Date(appt.scheduledAt), "HH:mm")}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-neutral-dark">Selesai</dt>
                <dd className="text-neutral-muted mt-0.5">
                  {format(new Date(appt.endsAt), "HH:mm")}
                </dd>
              </div>
            </dl>

            {appt.consultationNotes && (
              <div className="mt-4 pt-4 border-t border-neutral-border">
                <p className="text-[13px] font-bold text-neutral-dark mb-1">Catatan Konsultasi</p>
                <p className="text-[14px] text-neutral-muted whitespace-pre-wrap">
                  {appt.consultationNotes}
                </p>
              </div>
            )}

            {appt.cancellationReason && (
              <div className="mt-4 pt-4 border-t border-neutral-border">
                <p className="text-[13px] font-bold text-brand-pink mb-1">Alasan Pembatalan</p>
                <p className="text-[14px] text-neutral-muted">{appt.cancellationReason}</p>
              </div>
            )}
          </div>

          {/* Notes input for in-progress → completed */}
          {appt.status === "IN_PROGRESS" && (
            <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
              <h3 className="text-[16px] font-bold text-neutral-dark mb-3">Catatan Konsultasi</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Tulis catatan konsultasi sebelum menyelesaikan janji..."
                className="w-full border border-neutral-border rounded-[4px] px-3 py-2 text-[14px] text-neutral-dark placeholder:text-neutral-muted focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)] resize-none"
              />
            </div>
          )}

          {/* AI Summary */}
          {appt.status === "COMPLETED" && (
            <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-neutral-dark">Ringkasan AI</h3>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generating}
                  className="bg-brand-pink text-white rounded-btn h-[36px] px-4 text-[13px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
                >
                  {generating ? "Membuat..." : "Buat Ringkasan"}
                </button>
              </div>

              {summaryError && (
                <p className="text-[13px] text-brand-pink mb-3">{summaryError}</p>
              )}

              {summary ? (
                <div className="space-y-4">
                  {summary._stub && (
                    <p className="text-[12px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                      Mode demo — API key AI belum dikonfigurasi.
                    </p>
                  )}
                  <div>
                    <p className="text-[13px] font-bold text-neutral-dark mb-1">Ringkasan</p>
                    <p className="text-[14px] text-neutral-muted">{summary.summary}</p>
                  </div>
                  {summary.keyFindings.length > 0 && (
                    <div>
                      <p className="text-[13px] font-bold text-neutral-dark mb-1">Temuan Utama</p>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.keyFindings.map((f, i) => (
                          <li key={i} className="text-[14px] text-neutral-muted">{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.followUp.length > 0 && (
                    <div>
                      <p className="text-[13px] font-bold text-neutral-dark mb-1">Tindak Lanjut</p>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.followUp.map((f, i) => (
                          <li key={i} className="text-[14px] text-neutral-muted">{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                !generating && (
                  <p className="text-[14px] text-neutral-muted">
                    Klik "Buat Ringkasan" untuk menghasilkan ringkasan konsultasi dengan AI.
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-4">
          {transitions.length > 0 && (
            <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
              <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Ubah Status</h3>
              <div className="flex flex-col gap-2">
                {transitions.map((t) => (
                  <button
                    key={t.status}
                    onClick={() => handleTransition(t.status)}
                    disabled={updating}
                    className={`h-[40px] rounded-btn text-[14px] font-bold transition-colors disabled:opacity-60 ${t.color}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Navigasi</h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/patients/${appt.patientId}`}
                className="text-[14px] text-brand-pink hover:text-brand-pink-hover font-medium"
              >
                Profil Pasien →
              </Link>
              <Link
                href={`/admin/prescriptions?patientId=${appt.patientId}`}
                className="text-[14px] text-brand-pink hover:text-brand-pink-hover font-medium"
              >
                Resep Pasien →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <p className="text-[12px] text-neutral-muted">
              Dibuat:{" "}
              {format(new Date(appt.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
            </p>
            <p className="text-[12px] text-neutral-muted mt-1">
              Diperbarui:{" "}
              {format(new Date(appt.updatedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-card border border-neutral-border shadow-card w-[440px] p-6">
            <h3 className="text-[18px] font-bold text-neutral-dark mb-3">Batalkan Janji</h3>
            <p className="text-[14px] text-neutral-muted mb-4">
              Alasan pembatalan (opsional):
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="mis. Pasien meminta pembatalan"
              className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)] mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="h-[40px] px-4 text-[14px] font-bold border border-neutral-border rounded-btn hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmCancel}
                disabled={updating}
                className="h-[40px] px-4 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60"
              >
                Konfirmasi Pembatalan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

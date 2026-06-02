"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAppointments } from "@/hooks/use-appointments";
import { usePrescriptions } from "@/hooks/use-prescriptions";
import { useAuthStore } from "@/store/auth.store";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  IN_PROGRESS: "Sedang Berlangsung",
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

export default function PatientDashboard() {
  const { user } = useAuthStore();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const nextWeekStr = new Date(today.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const { data: upcomingAppts, isLoading: loadingAppts } = useAppointments({
    dateFrom: todayStr,
    dateTo: nextWeekStr,
    limit: 5,
  });

  const { data: recentRxPage, isLoading: loadingRx } = usePrescriptions();
  const recentRx = recentRxPage ? { ...recentRxPage, data: recentRxPage.data.slice(0, 3) } : undefined;

  const hour = today.getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat sore";

  const nextAppt = upcomingAppts?.data.find(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-neutral-dark">
          {greeting}, {user?.name?.split(" ")[0] ?? "Pasien"}!
        </h2>
        <p className="text-neutral-muted text-[14px] mt-1">
          {format(today, "EEEE, d MMMM yyyy", { locale: idLocale })}
        </p>
      </div>

      {/* Next appointment banner */}
      {nextAppt && (
        <div className="bg-blue-50 border border-blue-200 rounded-card p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-blue-700 uppercase tracking-wide mb-1">
              Janji Temu Berikutnya
            </p>
            <p className="text-[16px] font-bold text-neutral-dark">
              {format(new Date(nextAppt.scheduledAt), "EEEE, d MMMM — HH:mm", { locale: idLocale })}
            </p>
            <p className="text-[14px] text-neutral-muted mt-0.5">
              {nextAppt.serviceName} · dr. {nextAppt.doctorName}
            </p>
          </div>
          <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[nextAppt.status] ?? ""}`}>
            {STATUS_LABEL[nextAppt.status]}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Upcoming appointments */}
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-neutral-dark">Janji 7 Hari Ke Depan</h3>
          </div>

          {loadingAppts && <p className="text-[13px] text-neutral-muted">Memuat...</p>}

          {!loadingAppts && upcomingAppts?.data.length === 0 && (
            <p className="text-[14px] text-neutral-muted">Tidak ada janji dalam 7 hari ke depan.</p>
          )}

          <div className="divide-y divide-neutral-border">
            {upcomingAppts?.data.map((a) => (
              <div key={a.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-neutral-dark">{a.serviceName}</p>
                    <p className="text-[13px] text-neutral-muted mt-0.5">
                      {format(new Date(a.scheduledAt), "d MMM, HH:mm", { locale: idLocale })}
                      {" · dr. "}{a.doctorName}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ""}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent prescriptions */}
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-neutral-dark">Resep Terbaru</h3>
            <Link
              href="/patient/prescriptions"
              className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover"
            >
              Lihat Semua →
            </Link>
          </div>

          {loadingRx && <p className="text-[13px] text-neutral-muted">Memuat...</p>}

          {!loadingRx && recentRx?.data.length === 0 && (
            <p className="text-[14px] text-neutral-muted">Belum ada resep.</p>
          )}

          <div className="divide-y divide-neutral-border">
            {recentRx?.data.map((rx) => (
              <div key={rx.id} className="py-3">
                <p className="text-[14px] font-bold text-neutral-dark">
                  {rx.items.length} obat
                </p>
                <p className="text-[13px] text-neutral-muted mt-0.5">
                  dr. {rx.doctorName} ·{" "}
                  {format(new Date(rx.createdAt), "d MMM yyyy", { locale: idLocale })}
                </p>
                {rx.notes && (
                  <p className="text-[12px] text-neutral-muted mt-0.5 line-clamp-1">
                    {rx.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Layanan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/patient/triage"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[28px] mb-2">🩺</p>
          <p className="text-[15px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Cek Gejala
          </p>
          <p className="text-[12px] text-neutral-muted mt-1">
            Triage AI untuk panduan awal
          </p>
        </Link>
        <Link
          href="/patient/faq"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[28px] mb-2">💬</p>
          <p className="text-[15px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Tanya Klinik
          </p>
          <p className="text-[12px] text-neutral-muted mt-1">
            Jawaban instan seputar klinik
          </p>
        </Link>
        <Link
          href="/patient/prescriptions"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[28px] mb-2">💊</p>
          <p className="text-[15px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Resep Saya
          </p>
          <p className="text-[12px] text-neutral-muted mt-1">
            Lihat dan unduh resep digital
          </p>
        </Link>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[28px] mb-2">📞</p>
          <p className="text-[15px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Hubungi Klinik
          </p>
          <p className="text-[12px] text-neutral-muted mt-1">
            Chat langsung via WhatsApp
          </p>
        </a>
      </div>
    </div>
  );
}

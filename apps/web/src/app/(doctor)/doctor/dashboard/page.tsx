"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuthStore } from "@/store/auth.store";

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

export default function DoctorDashboard() {
  const { user } = useAuthStore();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

  const { data: todayAppts, isLoading } = useAppointments({
    dateFrom: todayStr,
    dateTo: tomorrowStr,
    limit: 10,
  });

  const confirmedCount = todayAppts?.data.filter(
    (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"
  ).length ?? 0;

  const completedCount = todayAppts?.data.filter(
    (a) => a.status === "COMPLETED"
  ).length ?? 0;

  const hour = today.getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat sore";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-neutral-dark">
          {greeting}, dr. {user?.name?.split(" ")[0] ?? "Dokter"}
        </h2>
        <p className="text-neutral-muted text-[14px] mt-1">
          {format(today, "EEEE, d MMMM yyyy", { locale: idLocale })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-5">
          <p className="text-[13px] font-bold text-neutral-muted uppercase tracking-wide">
            Janji Hari Ini
          </p>
          <p className="text-[32px] font-bold text-neutral-dark mt-1">
            {isLoading ? "—" : todayAppts?.data.length ?? 0}
          </p>
        </div>
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-5">
          <p className="text-[13px] font-bold text-neutral-muted uppercase tracking-wide">
            Akan Berlangsung
          </p>
          <p className="text-[32px] font-bold text-blue-600 mt-1">
            {isLoading ? "—" : confirmedCount}
          </p>
        </div>
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-5">
          <p className="text-[13px] font-bold text-neutral-muted uppercase tracking-wide">
            Selesai Hari Ini
          </p>
          <p className="text-[32px] font-bold text-green-600 mt-1">
            {isLoading ? "—" : completedCount}
          </p>
        </div>
      </div>

      {/* Jadwal hari ini */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-neutral-dark">Jadwal Hari Ini</h3>
          <Link
            href="/doctor/appointments"
            className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover"
          >
            Lihat Semua →
          </Link>
        </div>

        {isLoading && (
          <p className="text-[14px] text-neutral-muted">Memuat jadwal...</p>
        )}

        {!isLoading && todayAppts?.data.length === 0 && (
          <p className="text-[14px] text-neutral-muted">Tidak ada janji hari ini.</p>
        )}

        <div className="divide-y divide-neutral-border">
          {todayAppts?.data.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-[14px] font-bold text-neutral-dark">{a.patientName}</p>
                <p className="text-[13px] text-neutral-muted">
                  {format(new Date(a.scheduledAt), "HH:mm")}
                  {" — "}
                  {a.serviceName}
                  {" · "}
                  {a.type === "IN_PERSON" ? "Tatap Muka" : "Telekonsula"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ""}`}
                >
                  {STATUS_LABEL[a.status] ?? a.status}
                </span>
                <Link
                  href="/doctor/appointments"
                  className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover"
                >
                  Buka
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/doctor/appointments"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[16px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Kelola Janji Temu
          </p>
          <p className="text-[13px] text-neutral-muted mt-1">
            Mulai konsultasi, catat hasil, buat ringkasan AI
          </p>
        </Link>
        <Link
          href="/doctor/prescriptions"
          className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink transition-colors group"
        >
          <p className="text-[16px] font-bold text-neutral-dark group-hover:text-brand-pink">
            Resep & Obat
          </p>
          <p className="text-[13px] text-neutral-muted mt-1">
            Terbitkan dan kelola resep untuk pasien
          </p>
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useDashboardSummary } from "@/hooks/use-analytics";

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

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-neutral-border rounded-card shadow-card p-5 flex flex-col gap-1 hover:shadow-card-hover transition-shadow">
      <p className="text-[13px] font-medium text-neutral-muted">{label}</p>
      <p className="text-[28px] font-bold text-neutral-dark leading-none">{value}</p>
      {sub && <p className="text-[12px] text-neutral-muted mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { data, isLoading } = useDashboardSummary();

  const maxRevenue = data
    ? Math.max(...data.weekRevenue.map((d) => d.revenueIDR), 1)
    : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-[26px] font-bold text-neutral-dark">Dashboard</h2>
        <p className="text-[14px] text-neutral-muted mt-1">
          Ringkasan aktivitas klinik SehatHub
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Pasien"
          value={isLoading ? "—" : (data?.totalPatients ?? 0)}
          sub="Semua waktu"
          href="/admin/patients"
        />
        <StatCard
          label="Janji Temu Hari Ini"
          value={isLoading ? "—" : (data?.todayAppointments ?? 0)}
          sub={`${data?.pendingAppointments ?? 0} menunggu konfirmasi`}
          href="/admin/appointments"
        />
        <StatCard
          label="Total Pendapatan"
          value={isLoading ? "—" : formatIDR(data?.totalRevenueIDR ?? 0)}
          sub="Semua waktu (lunas)"
        />
        <StatCard
          label="Dokter Aktif"
          value={isLoading ? "—" : (data?.totalDoctors ?? 0)}
          sub={`${data?.weekAppointments ?? 0} janji 7 hari terakhir`}
          href="/admin/doctors"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white border border-neutral-border rounded-card shadow-card p-6">
          <h3 className="text-[16px] font-bold text-neutral-dark mb-4">
            Pendapatan 7 Hari Terakhir
          </h3>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-neutral-muted text-[14px]">
              Memuat...
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {(data?.weekRevenue ?? []).map((day) => {
                const pct = Math.max(4, (day.revenueIDR / maxRevenue) * 100);
                const dateLabel = format(new Date(day.date), "EEE", { locale: idLocale });
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-full bg-brand-pink rounded-t-[4px] transition-all group-hover:opacity-80 relative"
                      style={{ height: `${pct}%` }}
                      title={formatIDR(day.revenueIDR)}
                    />
                    <span className="text-[11px] text-neutral-muted capitalize">
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
          <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Aksi Cepat</h3>
          <div className="flex flex-col gap-2">
            {[
              { href: "/admin/appointments", label: "Lihat Semua Janji" },
              { href: "/admin/patients", label: "Manajemen Pasien" },
              { href: "/admin/doctors", label: "Manajemen Dokter" },
              { href: "/admin/services", label: "Kelola Layanan" },
              { href: "/admin/prescriptions", label: "Daftar Resep" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-brand-pink hover:text-brand-pink-hover px-3 py-2 rounded border border-neutral-border hover:border-brand-pink transition-colors"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border">
          <h3 className="text-[16px] font-bold text-neutral-dark">Janji Temu Terbaru</h3>
          <Link
            href="/admin/appointments"
            className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover"
          >
            Lihat Semua →
          </Link>
        </div>
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-6 py-3 font-bold text-neutral-dark">Pasien</th>
              <th className="text-left px-6 py-3 font-bold text-neutral-dark">Dokter</th>
              <th className="text-left px-6 py-3 font-bold text-neutral-dark">Layanan</th>
              <th className="text-left px-6 py-3 font-bold text-neutral-dark">Waktu</th>
              <th className="text-left px-6 py-3 font-bold text-neutral-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-muted">
                  Memuat...
                </td>
              </tr>
            )}
            {!isLoading && (data?.recentAppointments ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-muted">
                  Belum ada janji temu
                </td>
              </tr>
            )}
            {(data?.recentAppointments ?? []).map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-neutral-dark">{a.patientName}</td>
                <td className="px-6 py-3 text-neutral-muted">{a.doctorName}</td>
                <td className="px-6 py-3 text-neutral-muted">{a.serviceName}</td>
                <td className="px-6 py-3 text-neutral-muted">
                  {format(new Date(a.scheduledAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ""}`}
                  >
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

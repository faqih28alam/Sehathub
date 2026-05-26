"use client";

import { useState } from "react";
import { useAppointments } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

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

export default function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAppointments({
    status: statusFilter as never || undefined,
    page,
    limit: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Janji Temu</h2>
        <Link
          href="/admin/appointments/new"
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold flex items-center hover:bg-brand-pink-hover"
        >
          + Buat Janji
        </Link>
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card p-4 mb-4 flex gap-2">
        {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
              statusFilter === s
                ? "bg-brand-pink text-white"
                : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
            }`}
          >
            {s ? STATUS_LABEL[s] : "Semua"}
          </button>
        ))}
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Pasien</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Dokter</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Layanan</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Waktu</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Tipe</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-muted">Memuat...</td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-muted">
                  Tidak ada janji ditemukan
                </td>
              </tr>
            )}
            {data?.data.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-neutral-dark">{a.patientName}</td>
                <td className="px-4 py-3 text-neutral-muted">{a.doctorName}</td>
                <td className="px-4 py-3 text-neutral-muted">{a.serviceName}</td>
                <td className="px-4 py-3 text-neutral-muted">
                  {format(new Date(a.scheduledAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                </td>
                <td className="px-4 py-3 text-neutral-muted">
                  {a.type === "IN_PERSON" ? "Tatap Muka" : "Telekonsula"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ""}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/appointments/${a.id}`}
                    className="text-brand-pink hover:text-brand-pink-hover font-bold text-[13px]"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-border">
            <p className="text-[13px] text-neutral-muted">
              {data.total} janji — halaman {data.page} dari {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-[13px] px-3 py-1 rounded border border-neutral-border disabled:opacity-40 hover:border-brand-pink"
              >
                ← Sebelumnya
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-[13px] px-3 py-1 rounded border border-neutral-border disabled:opacity-40 hover:border-brand-pink"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

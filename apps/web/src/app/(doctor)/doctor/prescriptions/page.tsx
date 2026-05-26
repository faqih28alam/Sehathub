"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { usePrescriptions } from "@/hooks/use-prescriptions";

export default function DoctorPrescriptionsPage() {
  const { data, isLoading } = usePrescriptions();

  return (
    <div>
      <h2 className="text-[24px] font-bold text-neutral-dark mb-6">Resep Saya</h2>

      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Pasien</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Jumlah Obat</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Tanggal</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr><td colSpan={4} className="text-center py-8 text-neutral-muted">Memuat...</td></tr>
            )}
            {!isLoading && (!data?.data || data.data.length === 0) && (
              <tr><td colSpan={4} className="text-center py-8 text-neutral-muted">Belum ada resep</td></tr>
            )}
            {data?.data.map((rx) => (
              <tr key={rx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-neutral-dark">{rx.patientName}</td>
                <td className="px-4 py-3 text-neutral-muted">{rx.items.length} obat</td>
                <td className="px-4 py-3 text-neutral-muted">
                  {format(new Date(rx.issuedAt), "d MMM yyyy", { locale: idLocale })}
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <Link
                    href={`/doctor/prescriptions/${rx.id}`}
                    className="text-brand-pink hover:text-brand-pink-hover font-bold text-[13px]"
                  >
                    Detail
                  </Link>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${rx.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-muted hover:text-neutral-dark text-[13px]"
                  >
                    PDF ↓
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

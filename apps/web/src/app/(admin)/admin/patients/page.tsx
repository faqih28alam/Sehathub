"use client";

import { useState } from "react";
import Link from "next/link";
import { usePatients } from "@/hooks/use-patients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePatients({ search: search || undefined, page, limit: 20 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Pasien</h2>
        <Link href="/admin/patients/new">
          <Button>+ Tambah Pasien</Button>
        </Link>
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card p-4 mb-4">
        <Input
          placeholder="Cari nama, email, atau telepon..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-[360px]"
        />
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Nama</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Email</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Telepon</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Kewarganegaraan</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-muted">
                  Memuat...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-muted">
                  Tidak ada pasien ditemukan
                </td>
              </tr>
            )}
            {data?.data.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-neutral-dark">{patient.name}</td>
                <td className="px-4 py-3 text-neutral-muted">{patient.email}</td>
                <td className="px-4 py-3 text-neutral-muted">{patient.phone ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-muted">{patient.nationality ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                      patient.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-neutral-muted"
                    }`}
                  >
                    {patient.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/patients/${patient.id}`}
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
              {data.total} pasien — halaman {data.page} dari {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

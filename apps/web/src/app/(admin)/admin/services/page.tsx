"use client";

import { useServices } from "@/hooks/use-services";

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL_CONSULTATION: "Konsultasi Umum",
  EMERGENCY: "Darurat",
  PRESCRIPTION: "Resep",
  LAB_TEST: "Lab",
  SPECIALIST: "Spesialis",
  OTHER: "Lainnya",
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Layanan & Harga</h2>
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Layanan</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Kategori</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Durasi</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Harga (IDR)</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Harga (USD)</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-muted">Memuat...</td>
              </tr>
            )}
            {services?.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-dark">{service.name}</p>
                  {service.description && (
                    <p className="text-[12px] text-neutral-muted">{service.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-muted">
                  {CATEGORY_LABEL[service.category] ?? service.category}
                </td>
                <td className="px-4 py-3 text-neutral-muted">{service.durationMinutes} menit</td>
                <td className="px-4 py-3 font-medium text-neutral-dark">{formatIDR(service.priceIDR)}</td>
                <td className="px-4 py-3 text-neutral-muted">
                  {service.priceUSD ? `$${service.priceUSD.toFixed(0)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-neutral-muted"
                    }`}
                  >
                    {service.isActive ? "Aktif" : "Nonaktif"}
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

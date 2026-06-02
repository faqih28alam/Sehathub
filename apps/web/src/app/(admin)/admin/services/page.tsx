"use client";

import { useState } from "react";
import { useServices, useCreateService, useUpdateService } from "@/hooks/use-services";
import type { ServiceItem, ServiceCategory } from "@sehathub/types";

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "GENERAL_CONSULTATION", label: "Konsultasi Umum" },
  { value: "EMERGENCY", label: "Darurat" },
  { value: "PRESCRIPTION", label: "Resep" },
  { value: "LAB_TEST", label: "Lab" },
  { value: "SPECIALIST", label: "Spesialis" },
  { value: "OTHER", label: "Lainnya" },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function ServiceModal({
  initial,
  onClose,
}: {
  initial?: ServiceItem;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? "GENERAL_CONSULTATION");
  const [duration, setDuration] = useState(String(initial?.durationMinutes ?? 30));
  const [priceIDR, setPriceIDR] = useState(String(initial?.priceIDR ?? ""));
  const [priceUSD, setPriceUSD] = useState(String(initial?.priceUSD ?? ""));
  const [error, setError] = useState("");

  const { mutateAsync: createService, isPending: creating } = useCreateService();
  const { mutateAsync: updateService, isPending: updating } = useUpdateService(initial?.id ?? "");
  const isPending = creating || updating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Nama layanan wajib diisi."); return; }
    if (!priceIDR || isNaN(Number(priceIDR))) { setError("Harga IDR wajib diisi."); return; }

    const dto = {
      name: name.trim(),
      description: description || undefined,
      category,
      durationMinutes: Number(duration) || 30,
      priceIDR: Number(priceIDR),
      priceUSD: priceUSD ? Number(priceUSD) : undefined,
    };

    try {
      if (initial) {
        await updateService(dto);
      } else {
        await createService(dto);
      }
      onClose();
    } catch {
      setError("Gagal menyimpan layanan. Coba lagi.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-card border border-neutral-border shadow-card w-[520px] p-6">
        <h3 className="text-[18px] font-bold text-neutral-dark mb-5">
          {initial ? "Edit Layanan" : "Tambah Layanan"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-1">Nama Layanan</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="mis. Konsultasi Umum"
              className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]" />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-1">Deskripsi (opsional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat layanan"
              className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Durasi (menit)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min={5} step={5}
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Harga (IDR)</label>
              <input type="number" value={priceIDR} onChange={(e) => setPriceIDR(e.target.value)} min={0}
                placeholder="mis. 300000"
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Harga (USD, opsional)</label>
              <input type="number" value={priceUSD} onChange={(e) => setPriceUSD(e.target.value)} min={0}
                placeholder="mis. 20"
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
            </div>
          </div>

          {error && <p className="text-[13px] text-brand-pink">{error}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="h-[40px] px-4 text-[14px] font-bold border border-neutral-border rounded-btn hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={isPending}
              className="h-[40px] px-5 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60">
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleButton({ service }: { service: ServiceItem }) {
  const { mutateAsync: updateService, isPending } = useUpdateService(service.id);
  return (
    <button
      onClick={() => updateService({ isActive: !service.isActive })}
      disabled={isPending}
      className={`text-[12px] font-bold px-2 py-0.5 rounded-full transition-colors disabled:opacity-60 ${
        service.isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
      }`}
    >
      {service.isActive ? "Aktif" : "Nonaktif"}
    </button>
  );
}

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceItem | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Layanan & Harga</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold hover:bg-brand-pink-hover"
        >
          + Tambah Layanan
        </button>
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Layanan</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Kategori</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Durasi</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">IDR</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">USD</th>
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
            {services?.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-dark">{s.name}</p>
                  {s.description && (
                    <p className="text-[12px] text-neutral-muted">{s.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-muted">{CATEGORY_LABEL[s.category] ?? s.category}</td>
                <td className="px-4 py-3 text-neutral-muted">{s.durationMinutes} mnt</td>
                <td className="px-4 py-3 font-medium text-neutral-dark">{formatIDR(s.priceIDR)}</td>
                <td className="px-4 py-3 text-neutral-muted">
                  {s.priceUSD ? `$${s.priceUSD.toFixed(0)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <ToggleButton service={s} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditTarget(s)}
                    className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && (!services || services.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-muted">Belum ada layanan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && <ServiceModal onClose={() => setShowCreate(false)} />}
      {editTarget && <ServiceModal initial={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}

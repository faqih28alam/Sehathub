"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useLeads, useLeadCounts, useCreateLead, type LeadSource } from "@/hooks/use-crm";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  QUALIFIED: "Tertarik",
  CONVERTED: "Konversi",
  LOST: "Hilang",
};

const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  LOST: "bg-gray-100 text-neutral-muted",
};

const SOURCE_LABEL: Record<string, string> = {
  WALK_IN: "Walk-in",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "Sosmed",
  OTHER: "Lainnya",
};

const ALL_SOURCES: LeadSource[] = [
  "WALK_IN",
  "WHATSAPP",
  "WEBSITE",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "OTHER",
];

export default function CrmPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // New lead form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "OTHER" as LeadSource,
    notes: "",
  });
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useLeads({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const { data: counts } = useLeadCounts();
  const { mutateAsync: createLead, isPending } = useCreateLead();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Nama wajib diisi"); return; }
    setFormError("");
    await createLead({ ...form, email: form.email || undefined, phone: form.phone || undefined, notes: form.notes || undefined });
    setForm({ name: "", email: "", phone: "", source: "OTHER", notes: "" });
    setShowModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-neutral-dark">CRM — Pipeline Lead</h2>
          <p className="text-[14px] text-neutral-muted mt-1">Kelola prospek dan aktivitas penjualan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold hover:bg-brand-pink-hover"
        >
          + Tambah Lead
        </button>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-5 gap-3">
        {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
            className={`p-3 rounded-card border text-left transition-all ${
              statusFilter === s
                ? "border-brand-pink bg-brand-pink/5"
                : "border-neutral-border bg-white hover:border-brand-pink/40"
            }`}
          >
            <p className="text-[22px] font-bold text-neutral-dark">{counts?.[s] ?? 0}</p>
            <p className="text-[12px] text-neutral-muted mt-0.5">{STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
            statusFilter === "" ? "bg-brand-pink text-white" : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
          }`}
        >
          Semua
        </button>
        {Object.entries(STATUS_LABEL).map(([s, label]) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s === statusFilter ? "" : s); setPage(1); }}
            className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
              statusFilter === s ? "bg-brand-pink text-white" : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leads table */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Nama</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Kontak</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Sumber</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Aktivitas</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Dibuat</th>
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
                <td colSpan={7} className="text-center py-8 text-neutral-muted">Tidak ada lead ditemukan</td>
              </tr>
            )}
            {data?.data.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-neutral-dark">{lead.name}</td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {lead.phone && <div>{lead.phone}</div>}
                  {lead.email && <div>{lead.email}</div>}
                  {!lead.phone && !lead.email && "—"}
                </td>
                <td className="px-4 py-3 text-neutral-muted">{SOURCE_LABEL[lead.source]}</td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[lead.status] ?? ""}`}>
                    {STATUS_LABEL[lead.status] ?? lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {lead.activityCount ?? 0} catatan
                </td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {format(new Date(lead.createdAt), "d MMM yyyy", { locale: idLocale })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/crm/${lead.id}`}
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
              {data.total} lead — halaman {data.page} dari {data.totalPages}
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

      {/* Create Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-card w-full max-w-md p-6">
            <h3 className="text-[18px] font-bold text-neutral-dark mb-4">Tambah Lead Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {formError && (
                <p className="text-[13px] text-brand-pink bg-[#FFE5EB] border border-brand-pink rounded px-3 py-2">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Nama *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-bold text-neutral-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                    placeholder="opsional"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-neutral-dark mb-1">Telepon</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                    placeholder="opsional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Sumber</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}
                  className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                >
                  {ALL_SOURCES.map((s) => (
                    <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Catatan</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-neutral-border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none"
                  rows={3}
                  placeholder="Kebutuhan atau informasi awal..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-brand-pink text-white h-[40px] rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
                >
                  {isPending ? "Menyimpan..." : "Simpan Lead"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-neutral-border h-[40px] rounded-btn text-[14px] font-medium hover:border-brand-pink"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

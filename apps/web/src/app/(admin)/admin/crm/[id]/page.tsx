"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useLead, useUpdateLead, useAddActivity, type LeadStatus } from "@/hooks/use-crm";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "Baru" },
  { value: "CONTACTED", label: "Dihubungi" },
  { value: "QUALIFIED", label: "Tertarik" },
  { value: "CONVERTED", label: "Konversi" },
  { value: "LOST", label: "Hilang" },
];

const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  LOST: "bg-gray-100 text-neutral-muted",
};

const ACTIVITY_TYPES = ["call", "email", "whatsapp", "note", "meeting"];
const ACTIVITY_ICON: Record<string, string> = {
  call: "📞",
  email: "✉️",
  whatsapp: "💬",
  note: "📝",
  meeting: "🤝",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(id);
  const { mutateAsync: updateLead } = useUpdateLead(id);
  const { mutateAsync: addActivity, isPending: addingActivity } = useAddActivity(id);

  const [activityType, setActivityType] = useState("note");
  const [activityNotes, setActivityNotes] = useState("");
  const [activityError, setActivityError] = useState("");

  if (isLoading) {
    return <div className="text-neutral-muted text-[14px]">Memuat...</div>;
  }
  if (!lead) {
    return <div className="text-neutral-muted text-[14px]">Lead tidak ditemukan.</div>;
  }

  async function handleStatusChange(status: LeadStatus) {
    await updateLead({ status });
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityNotes.trim()) { setActivityError("Catatan wajib diisi"); return; }
    setActivityError("");
    await addActivity({ type: activityType, notes: activityNotes });
    setActivityNotes("");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-[13px] text-neutral-muted">
        <Link href="/admin/crm" className="hover:text-brand-pink">← CRM</Link>
        <span>/</span>
        <span className="text-neutral-dark font-medium">{lead.name}</span>
      </div>

      {/* Lead info card */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[22px] font-bold text-neutral-dark">{lead.name}</h2>
            {lead.email && <p className="text-[14px] text-neutral-muted">{lead.email}</p>}
            {lead.phone && <p className="text-[14px] text-neutral-muted">{lead.phone}</p>}
          </div>
          <span className={`text-[13px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[lead.status]}`}>
            {STATUS_OPTIONS.find((s) => s.value === lead.status)?.label}
          </span>
        </div>

        {lead.notes && (
          <p className="text-[14px] text-neutral-muted bg-gray-50 rounded px-3 py-2 mb-4">
            {lead.notes}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-neutral-muted font-medium">Pindah status:</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={opt.value === lead.status}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-[12px] px-3 py-1 rounded-full font-medium transition-colors ${
                opt.value === lead.status
                  ? "bg-brand-pink text-white cursor-default"
                  : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add activity */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
        <h3 className="text-[16px] font-bold text-neutral-dark mb-3">Tambah Aktivitas</h3>
        <form onSubmit={handleAddActivity} className="space-y-3">
          {activityError && (
            <p className="text-[13px] text-brand-pink">{activityError}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActivityType(t)}
                className={`text-[13px] px-3 py-1 rounded-full font-medium capitalize transition-colors ${
                  activityType === t
                    ? "bg-brand-pink text-white"
                    : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
                }`}
              >
                {ACTIVITY_ICON[t]} {t}
              </button>
            ))}
          </div>
          <textarea
            value={activityNotes}
            onChange={(e) => setActivityNotes(e.target.value)}
            className="w-full border border-neutral-border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none"
            rows={3}
            placeholder="Catatan aktivitas..."
          />
          <button
            type="submit"
            disabled={addingActivity}
            className="bg-brand-pink text-white h-[40px] px-6 rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
          >
            {addingActivity ? "Menyimpan..." : "Simpan Aktivitas"}
          </button>
        </form>
      </div>

      {/* Activity log */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-border">
          <h3 className="text-[16px] font-bold text-neutral-dark">
            Riwayat Aktivitas ({lead.activities.length})
          </h3>
        </div>
        {lead.activities.length === 0 ? (
          <p className="text-center py-8 text-neutral-muted text-[14px]">
            Belum ada aktivitas
          </p>
        ) : (
          <div className="divide-y divide-neutral-border">
            {lead.activities.map((a) => (
              <div key={a.id} className="px-6 py-4 flex gap-3">
                <span className="text-[20px] mt-0.5">{ACTIVITY_ICON[a.type] ?? "📋"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-bold text-neutral-dark capitalize">{a.type}</span>
                    <span className="text-[12px] text-neutral-muted">
                      {format(new Date(a.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                    </span>
                  </div>
                  <p className="text-[14px] text-neutral-muted">{a.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

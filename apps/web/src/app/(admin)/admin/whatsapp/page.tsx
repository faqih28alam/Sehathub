"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useWhatsAppMessages, useSendWhatsApp } from "@/hooks/use-whatsapp";

const STATUS_COLOR: Record<string, string> = {
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  read: "bg-green-200 text-green-800",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-neutral-muted",
  received: "bg-purple-100 text-purple-700",
};

export default function WhatsAppPage() {
  const [dirFilter, setDirFilter] = useState("");
  const [page, setPage] = useState(1);

  const [sendTo, setSendTo] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  const { data, isLoading, refetch } = useWhatsAppMessages({
    direction: dirFilter || undefined,
    page,
    limit: 20,
  });

  const { mutateAsync: sendMessage, isPending } = useSendWhatsApp();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSendError("");
    setSendSuccess(false);
    if (!sendTo.trim()) { setSendError("Nomor telepon wajib diisi"); return; }
    if (!sendBody.trim()) { setSendError("Pesan wajib diisi"); return; }
    try {
      await sendMessage({ to: sendTo.trim(), body: sendBody.trim() });
      setSendSuccess(true);
      setSendTo("");
      setSendBody("");
      refetch();
    } catch {
      setSendError("Gagal mengirim pesan. Periksa konfigurasi WhatsApp API.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-bold text-neutral-dark">WhatsApp</h2>
        <p className="text-[14px] text-neutral-muted mt-1">
          Riwayat pesan dan pengiriman manual via Meta Cloud API
        </p>
      </div>

      {/* Send manual message */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
        <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Kirim Pesan Manual</h3>
        <form onSubmit={handleSend} className="space-y-3 max-w-lg">
          {sendError && (
            <p className="text-[13px] text-brand-pink bg-[#FFE5EB] border border-brand-pink rounded px-3 py-2">
              {sendError}
            </p>
          )}
          {sendSuccess && (
            <p className="text-[13px] text-green-700 bg-green-50 border border-green-300 rounded px-3 py-2">
              Pesan berhasil dikirim!
            </p>
          )}
          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-1">
              Nomor Telepon (format E.164)
            </label>
            <input
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="+628123456789"
              className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
            />
          </div>
          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-1">Pesan</label>
            <textarea
              value={sendBody}
              onChange={(e) => setSendBody(e.target.value)}
              rows={3}
              placeholder="Tulis pesan WhatsApp..."
              className="w-full border border-neutral-border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-pink text-white h-[40px] px-6 rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
          >
            {isPending ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      </div>

      {/* Message log */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
          <h3 className="text-[16px] font-bold text-neutral-dark">Riwayat Pesan</h3>
          <div className="flex gap-2">
            {["", "OUTBOUND", "INBOUND"].map((d) => (
              <button
                key={d}
                onClick={() => { setDirFilter(d); setPage(1); }}
                className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
                  dirFilter === d
                    ? "bg-brand-pink text-white"
                    : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
                }`}
              >
                {d === "" ? "Semua" : d === "OUTBOUND" ? "Keluar" : "Masuk"}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Arah</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Nomor</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Pesan</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Template</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-muted">Memuat...</td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-muted">
                  Belum ada pesan
                </td>
              </tr>
            )}
            {data?.data.map((msg) => (
              <tr key={msg.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                    msg.direction === "OUTBOUND"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                  }`}>
                    {msg.direction === "OUTBOUND" ? "↑ Keluar" : "↓ Masuk"}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-muted font-mono text-[13px]">
                  {msg.to ?? msg.from ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-dark max-w-xs">
                  <p className="truncate" title={msg.body}>{msg.body}</p>
                </td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {msg.templateName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[msg.status] ?? "bg-gray-100"}`}>
                    {msg.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {format(new Date(msg.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-border">
            <p className="text-[13px] text-neutral-muted">
              {data.total} pesan — halaman {data.page} dari {data.totalPages}
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

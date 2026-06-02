"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { usePayments, useRecordManualPayment } from "@/hooks/use-payments";
import { usePatients } from "@/hooks/use-patients";
import { useAppointments } from "@/hooks/use-appointments";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
  REFUNDED: "Dikembalikan",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-neutral-muted",
};

const METHOD_LABEL: Record<string, string> = {
  MIDTRANS: "Midtrans",
  STRIPE: "Stripe",
  CASH: "Tunai",
  BANK_TRANSFER: "Transfer Bank",
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Manual payment form state
  const [apptId, setApptId] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { data, isLoading } = usePayments({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const { data: pendingAppts } = useAppointments({ status: "CONFIRMED" as never, limit: 100 });
  const { mutateAsync: recordManual, isPending: recording } = useRecordManualPayment();

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!apptId) { setFormError("Pilih janji temu."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setFormError("Masukkan jumlah yang valid."); return; }
    try {
      await recordManual({ appointmentId: apptId, method, amountIDR: Number(amount), notes: notes || undefined });
      setShowModal(false);
      setApptId(""); setAmount(""); setNotes("");
    } catch {
      setFormError("Gagal mencatat pembayaran. Coba lagi.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Pembayaran</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold hover:bg-brand-pink-hover"
        >
          + Catat Pembayaran Manual
        </button>
      </div>

      {/* Status filter */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card p-4 mb-4 flex gap-2 flex-wrap">
        {["", "PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
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

      {/* Table */}
      <div className="bg-white border border-neutral-border rounded-card shadow-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-gray-50 border-b border-neutral-border">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Pasien</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">No. Invoice</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Jumlah</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Metode</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Status</th>
              <th className="text-left px-4 py-3 font-bold text-neutral-dark">Tanggal</th>
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
                <td colSpan={6} className="text-center py-8 text-neutral-muted">Tidak ada data pembayaran.</td>
              </tr>
            )}
            {data?.data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-neutral-dark">{p.patientName}</td>
                <td className="px-4 py-3 text-neutral-muted font-mono text-[12px]">
                  {p.invoiceNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-dark font-bold">
                  {formatIDR(p.amountIDR)}
                  {p.amountUSD && (
                    <span className="ml-1 text-[12px] text-neutral-muted font-normal">
                      / ${p.amountUSD}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-muted">{METHOD_LABEL[p.method] ?? p.method}</td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? ""}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-muted text-[13px]">
                  {p.paidAt
                    ? format(new Date(p.paidAt), "d MMM yyyy, HH:mm", { locale: idLocale })
                    : format(new Date(p.createdAt), "d MMM yyyy", { locale: idLocale })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-border">
            <p className="text-[13px] text-neutral-muted">
              {data.total} transaksi — halaman {data.page} dari {data.totalPages}
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

      {/* Manual payment modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-card border border-neutral-border shadow-card w-[480px] p-6">
            <h3 className="text-[18px] font-bold text-neutral-dark mb-4">Catat Pembayaran Manual</h3>
            <form onSubmit={handleRecord} className="flex flex-col gap-4">
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">
                  Janji Temu (Dikonfirmasi)
                </label>
                <select
                  value={apptId}
                  onChange={(e) => setApptId(e.target.value)}
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink"
                >
                  <option value="">Pilih janji temu...</option>
                  {pendingAppts?.data.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} — {a.serviceName} —{" "}
                      {format(new Date(a.scheduledAt), "d MMM, HH:mm", { locale: idLocale })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Metode</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "CASH" | "BANK_TRANSFER")}
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink"
                >
                  <option value="CASH">Tunai</option>
                  <option value="BANK_TRANSFER">Transfer Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">
                  Jumlah (IDR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="mis. 300000"
                  min={0}
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="mis. Nomor bukti transfer"
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]"
                />
              </div>

              {formError && (
                <p className="text-[13px] text-brand-pink">{formError}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  className="h-[40px] px-4 text-[14px] font-bold border border-neutral-border rounded-btn hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="h-[40px] px-4 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60"
                >
                  {recording ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

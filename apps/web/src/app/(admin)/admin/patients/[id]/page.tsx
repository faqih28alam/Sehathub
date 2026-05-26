"use client";

import Link from "next/link";
import { usePatient, usePatientTimeline } from "@/hooks/use-patients";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { data: patient, isLoading } = usePatient(params.id);
  const { data: timeline } = usePatientTimeline(params.id);

  if (isLoading) {
    return <div className="text-neutral-muted">Memuat...</div>;
  }
  if (!patient) {
    return <div className="text-brand-pink">Pasien tidak ditemukan</div>;
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/patients" className="text-neutral-muted hover:text-brand-pink text-[14px]">
          ← Daftar Pasien
        </Link>
        <span className="text-neutral-muted">/</span>
        <span className="text-[14px] text-neutral-dark">{patient.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1 bg-white border border-neutral-border rounded-card shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink font-bold text-[18px]">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-neutral-dark text-[16px]">{patient.name}</h3>
              <p className="text-[12px] text-neutral-muted">{patient.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-[13px]">
            {patient.phone && (
              <div className="flex justify-between">
                <span className="text-neutral-muted">Telepon</span>
                <span className="text-neutral-dark">{patient.phone}</span>
              </div>
            )}
            {patient.nationality && (
              <div className="flex justify-between">
                <span className="text-neutral-muted">Kewarganegaraan</span>
                <span className="text-neutral-dark">{patient.nationality}</span>
              </div>
            )}
            {patient.passportId && (
              <div className="flex justify-between">
                <span className="text-neutral-muted">No. Paspor</span>
                <span className="text-neutral-dark">{patient.passportId}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex justify-between">
                <span className="text-neutral-muted">Alamat</span>
                <span className="text-neutral-dark text-right max-w-[160px]">{patient.address}</span>
              </div>
            )}
          </div>

          {patient.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {patient.tags.map((tag) => (
                <span key={tag} className="text-[11px] bg-gray-100 text-neutral-muted px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {patient.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-[12px] text-neutral-muted">
              <p className="font-bold text-neutral-dark mb-1">Catatan Admin</p>
              {patient.notes}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="col-span-2 bg-white border border-neutral-border rounded-card shadow-card p-6">
          <h3 className="font-bold text-neutral-dark text-[16px] mb-4">Riwayat Aktivitas</h3>
          {!timeline || timeline.length === 0 ? (
            <p className="text-[13px] text-neutral-muted">Belum ada aktivitas</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(timeline as Array<{ type: string; date: string; data: Record<string, unknown> }>).map((event, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      event.type === "appointment" ? "bg-blue-400" : "bg-green-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-[13px] text-neutral-dark font-medium">
                        {event.type === "appointment"
                          ? `Janji — ${String(event.data.serviceName)} dengan ${String(event.data.doctorName)}`
                          : `Pembayaran ${formatIDR(Number(event.data.amountIDR))}`}
                      </span>
                      <span className="text-[12px] text-neutral-muted">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: idLocale })}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        String(event.data.status) === "COMPLETED" || String(event.data.status) === "PAID"
                          ? "text-green-600"
                          : String(event.data.status) === "CANCELLED" || String(event.data.status) === "FAILED"
                          ? "text-brand-pink"
                          : "text-neutral-muted"
                      }`}
                    >
                      {String(event.data.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

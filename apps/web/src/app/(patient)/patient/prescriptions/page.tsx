"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useCurrentUser } from "@/hooks/use-auth";
import { usePatientPrescriptions } from "@/hooks/use-prescriptions";
import { useAuthStore } from "@/store/auth.store";

export default function PatientPrescriptionsPage() {
  const { user } = useAuthStore();
  const { data: me } = useCurrentUser();

  // Patient ID comes from the patient profile — for now use userId correlation
  const userId = user?.id ?? me?.id ?? "";

  // We'll filter by the logged-in user's patient record
  const { data: prescriptions, isLoading } = usePatientPrescriptions(userId);

  return (
    <div>
      <h2 className="text-[24px] font-bold text-neutral-dark mb-6">Resep Saya</h2>

      {isLoading && <p className="text-neutral-muted">Memuat...</p>}

      {!isLoading && (!prescriptions || prescriptions.length === 0) && (
        <div className="bg-white border border-neutral-border rounded-card shadow-card p-8 text-center">
          <p className="text-neutral-muted">Belum ada resep dari dokter</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {prescriptions?.map((rx) => (
          <div
            key={rx.id}
            className="bg-white border border-neutral-border rounded-card shadow-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-neutral-dark text-[16px]">
                  Resep dari dr. {rx.doctorName}
                </p>
                <p className="text-[13px] text-neutral-muted">
                  {format(new Date(rx.issuedAt), "d MMMM yyyy", { locale: idLocale })}
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${rx.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-bold text-brand-pink hover:text-brand-pink-hover border border-brand-pink rounded-btn px-3 py-1"
              >
                Unduh PDF
              </a>
            </div>

            <div className="flex flex-col gap-2">
              {rx.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className="w-6 h-6 rounded-full bg-brand-pink flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-dark text-[14px]">
                      {item.medication} — {item.dosage}
                    </p>
                    <p className="text-[13px] text-neutral-muted">
                      {item.frequency} selama {item.duration}
                    </p>
                    {item.notes && (
                      <p className="text-[12px] text-neutral-muted italic">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {rx.notes && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-[13px] text-neutral-dark">
                <span className="font-bold">Catatan Dokter: </span>{rx.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, addMinutes } from "date-fns";
import { usePatients } from "@/hooks/use-patients";
import { useDoctors, useDoctorSlots } from "@/hooks/use-doctors";
import { useServices } from "@/hooks/use-services";
import { useCreateAppointment } from "@/hooks/use-appointments";

export default function NewAppointmentPage() {
  const router = useRouter();

  const [patientSearch, setPatientSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [type, setType] = useState<"IN_PERSON" | "TELECONSULT">("IN_PERSON");
  const [error, setError] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);

  const { data: patients } = usePatients({ search: patientSearch, limit: 10 });
  const { data: doctors } = useDoctors();
  const { data: services } = useServices();
  const { data: slots, isLoading: loadingSlots } = useDoctorSlots(doctorId, date);
  const { mutateAsync: createAppointment, isPending } = useCreateAppointment();

  const availableSlots = slots?.filter((s) => s.available) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!patientId) { setError("Pilih pasien."); return; }
    if (!doctorId) { setError("Pilih dokter."); return; }
    if (!serviceId) { setError("Pilih layanan."); return; }
    if (!slot) { setError("Pilih slot waktu."); return; }

    try {
      const appt = await createAppointment({ patientId, doctorId, serviceId, scheduledAt: slot, type });
      router.push(`/admin/appointments/${appt.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Gagal membuat janji. Coba lagi.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/appointments" className="text-neutral-muted hover:text-neutral-dark text-[14px]">
          ← Janji Temu
        </Link>
        <span className="text-neutral-border">/</span>
        <span className="text-[14px] text-neutral-dark font-medium">Buat Baru</span>
      </div>

      <h2 className="text-[24px] font-bold text-neutral-dark mb-6">Buat Janji Temu</h2>

      <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">
        {/* Patient */}
        <div className="relative">
          <label className="block text-[14px] font-bold text-neutral-dark mb-1">Pasien</label>
          {patientId ? (
            <div className="flex items-center justify-between h-[40px] border border-neutral-border rounded-[4px] px-3">
              <span className="text-[14px] text-neutral-dark">{patientName}</span>
              <button
                type="button"
                onClick={() => { setPatientId(""); setPatientName(""); setPatientSearch(""); }}
                className="text-[12px] text-neutral-muted hover:text-brand-pink"
              >
                Ubah
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => { setPatientSearch(e.target.value); setShowPatientList(true); }}
                onFocus={() => setShowPatientList(true)}
                placeholder="Cari nama pasien..."
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark placeholder:text-neutral-muted focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]"
              />
              {showPatientList && patients && patients.data.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-border rounded-[4px] shadow-card max-h-48 overflow-y-auto">
                  {patients.data.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setPatientId(p.id); setPatientName(p.name); setShowPatientList(false); }}
                      className="w-full text-left px-3 py-2 text-[14px] text-neutral-dark hover:bg-gray-50"
                    >
                      {p.name}
                      <span className="text-[12px] text-neutral-muted ml-2">{p.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-[14px] font-bold text-neutral-dark mb-1">Dokter</label>
          <select
            value={doctorId}
            onChange={(e) => { setDoctorId(e.target.value); setSlot(""); }}
            className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink"
          >
            <option value="">Pilih dokter...</option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id}>
                dr. {d.name}{d.specialization ? ` — ${d.specialization}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="block text-[14px] font-bold text-neutral-dark mb-1">Layanan</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink"
          >
            <option value="">Pilih layanan...</option>
            {services?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — Rp {s.priceIDR.toLocaleString("id-ID")}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[14px] font-bold text-neutral-dark mb-1">Tanggal</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => { setDate(e.target.value); setSlot(""); }}
            className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] text-neutral-dark focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]"
          />
        </div>

        {/* Time slots */}
        {doctorId && date && (
          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-2">Slot Waktu</label>
            {loadingSlots && (
              <p className="text-[13px] text-neutral-muted">Memuat slot...</p>
            )}
            {!loadingSlots && availableSlots.length === 0 && (
              <p className="text-[13px] text-neutral-muted">Tidak ada slot tersedia pada tanggal ini.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((s) => (
                <button
                  key={s.startTime}
                  type="button"
                  onClick={() => setSlot(s.startTime)}
                  className={`h-[36px] px-3 rounded border text-[13px] font-medium transition-colors ${
                    slot === s.startTime
                      ? "bg-brand-pink text-white border-brand-pink"
                      : "bg-white border-neutral-border text-neutral-dark hover:border-brand-pink"
                  }`}
                >
                  {format(new Date(s.startTime), "HH:mm")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-[14px] font-bold text-neutral-dark mb-2">Tipe Konsultasi</label>
          <div className="flex gap-3">
            {(["IN_PERSON", "TELECONSULT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`h-[40px] px-4 rounded border text-[14px] font-medium transition-colors ${
                  type === t
                    ? "bg-brand-pink text-white border-brand-pink"
                    : "bg-white border-neutral-border text-neutral-dark hover:border-brand-pink"
                }`}
              >
                {t === "IN_PERSON" ? "Tatap Muka" : "Telekonsula"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#FFE5EB] border border-brand-pink rounded-[8px] px-4 py-3">
            <p className="text-[13px] text-brand-pink">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/appointments"
            className="h-[40px] px-4 text-[14px] font-bold border border-neutral-border rounded-btn hover:bg-gray-50 flex items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="h-[40px] px-6 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60"
          >
            {isPending ? "Membuat..." : "Buat Janji"}
          </button>
        </div>
      </form>
    </div>
  );
}

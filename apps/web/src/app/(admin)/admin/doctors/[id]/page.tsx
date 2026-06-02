"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  useDoctor,
  useUpdateDoctor,
  useSetDoctorAvailability,
  useAddUnavailability,
} from "@/hooks/use-doctors";
import { useAppointments } from "@/hooks/use-appointments";
import type { DoctorAvailabilityDto } from "@sehathub/types";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-neutral-muted",
  NO_SHOW: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", CONFIRMED: "Dikonfirmasi", IN_PROGRESS: "Berlangsung",
  COMPLETED: "Selesai", CANCELLED: "Dibatalkan", NO_SHOW: "Tidak Hadir",
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const DEFAULT_SLOTS: DoctorAvailabilityDto[] = [1, 2, 3, 4, 5].map((day) => ({
  dayOfWeek: day,
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
}));

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, isLoading } = useDoctor(id);
  const { data: appointments } = useAppointments({ doctorId: id, limit: 5 });

  const { mutateAsync: updateDoctor, isPending: saving } = useUpdateDoctor(id);
  const { mutateAsync: setAvailability, isPending: savingAvail } = useSetDoctorAvailability(id);
  const { mutateAsync: addUnavailability, isPending: blockingDate } = useAddUnavailability(id);

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [spec, setSpec] = useState("");
  const [bio, setBio] = useState("");
  const [license, setLicense] = useState("");
  const [years, setYears] = useState("");
  const [fee, setFee] = useState("");
  const [accepting, setAccepting] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Availability
  const [availSlots, setAvailSlots] = useState<DoctorAvailabilityDto[]>(DEFAULT_SLOTS);
  const [availError, setAvailError] = useState("");
  const [availSuccess, setAvailSuccess] = useState(false);

  // Block date
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState(false);

  if (isLoading) return <div className="text-neutral-muted text-[14px]">Memuat...</div>;
  if (!doctor) return <div className="text-neutral-muted text-[14px]">Dokter tidak ditemukan.</div>;

  function startEdit() {
    setSpec(doctor!.specialization ?? "");
    setBio(doctor!.bio ?? "");
    setLicense(doctor!.licenseNumber ?? "");
    setYears(String(doctor!.yearsOfExperience));
    setFee(String(doctor!.consultationFeeIDR ?? ""));
    setAccepting(doctor!.isAcceptingPatients);
    setEditMode(true);
  }

  async function saveProfile() {
    setProfileError("");
    try {
      await updateDoctor({
        specialization: spec || undefined,
        bio: bio || undefined,
        licenseNumber: license || undefined,
        yearsOfExperience: years ? Number(years) : undefined,
        consultationFeeIDR: fee ? Number(fee) : undefined,
        isAcceptingPatients: accepting,
      });
      setEditMode(false);
    } catch {
      setProfileError("Gagal menyimpan. Coba lagi.");
    }
  }

  async function saveAvailability() {
    setAvailError(""); setAvailSuccess(false);
    try {
      await setAvailability(availSlots);
      setAvailSuccess(true);
      setTimeout(() => setAvailSuccess(false), 3000);
    } catch {
      setAvailError("Gagal menyimpan jadwal.");
    }
  }

  async function handleBlockDate(e: React.FormEvent) {
    e.preventDefault();
    setBlockError(""); setBlockSuccess(false);
    if (!blockDate) { setBlockError("Pilih tanggal."); return; }
    try {
      await addUnavailability({ date: blockDate, reason: blockReason || undefined });
      setBlockSuccess(true);
      setBlockDate(""); setBlockReason("");
      setTimeout(() => setBlockSuccess(false), 3000);
    } catch {
      setBlockError("Gagal memblokir tanggal.");
    }
  }

  function updateSlot(idx: number, field: keyof DoctorAvailabilityDto, value: string | number) {
    setAvailSlots((prev) =>
      prev.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    );
  }

  function toggleDay(day: number) {
    setAvailSlots((prev) => {
      const existing = prev.find((s) => s.dayOfWeek === day);
      if (existing) return prev.filter((s) => s.dayOfWeek !== day);
      return [...prev, { dayOfWeek: day, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 }]
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/doctors" className="text-neutral-muted hover:text-neutral-dark text-[14px]">
          ← Dokter
        </Link>
        <span className="text-neutral-border">/</span>
        <span className="text-[14px] text-neutral-dark font-medium">dr. {doctor.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Profile card */}
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[20px] font-bold text-neutral-dark">dr. {doctor.name}</h2>
                <p className="text-neutral-muted text-[14px]">{doctor.email}</p>
              </div>
              {!editMode ? (
                <button
                  onClick={startEdit}
                  className="h-[36px] px-4 text-[13px] font-bold border border-neutral-border rounded-btn hover:border-brand-pink"
                >
                  Edit Profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="h-[36px] px-3 text-[13px] border border-neutral-border rounded-btn hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="h-[36px] px-4 text-[13px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              )}
            </div>

            {!editMode ? (
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-[14px]">
                <div>
                  <dt className="font-bold text-neutral-dark">Spesialisasi</dt>
                  <dd className="text-neutral-muted mt-0.5">{doctor.specialization ?? "Dokter Umum"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-neutral-dark">No. Lisensi</dt>
                  <dd className="text-neutral-muted mt-0.5">{doctor.licenseNumber ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-neutral-dark">Pengalaman</dt>
                  <dd className="text-neutral-muted mt-0.5">{doctor.yearsOfExperience} tahun</dd>
                </div>
                <div>
                  <dt className="font-bold text-neutral-dark">Tarif Konsultasi</dt>
                  <dd className="text-neutral-muted mt-0.5">
                    {doctor.consultationFeeIDR ? formatIDR(doctor.consultationFeeIDR) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-neutral-dark">Menerima Pasien</dt>
                  <dd className={`mt-0.5 font-bold ${doctor.isAcceptingPatients ? "text-green-600" : "text-neutral-muted"}`}>
                    {doctor.isAcceptingPatients ? "Ya" : "Tidak"}
                  </dd>
                </div>
                {doctor.bio && (
                  <div className="col-span-2">
                    <dt className="font-bold text-neutral-dark">Bio</dt>
                    <dd className="text-neutral-muted mt-0.5">{doctor.bio}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-neutral-dark mb-1">Spesialisasi</label>
                  <input value={spec} onChange={(e) => setSpec(e.target.value)}
                    className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-neutral-dark mb-1">No. Lisensi</label>
                  <input value={license} onChange={(e) => setLicense(e.target.value)}
                    className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-neutral-dark mb-1">Pengalaman (tahun)</label>
                  <input type="number" value={years} onChange={(e) => setYears(e.target.value)} min={0}
                    className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-neutral-dark mb-1">Tarif (IDR)</label>
                  <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} min={0}
                    className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-neutral-dark mb-1">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    className="w-full border border-neutral-border rounded-[4px] px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="accepting" checked={accepting} onChange={(e) => setAccepting(e.target.checked)}
                    className="accent-brand-pink" />
                  <label htmlFor="accepting" className="text-[14px] font-medium text-neutral-dark">
                    Sedang menerima pasien baru
                  </label>
                </div>
                {profileError && <p className="col-span-2 text-[13px] text-brand-pink">{profileError}</p>}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Jadwal Mingguan</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const active = availSlots.some((s) => s.dayOfWeek === day);
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`h-[36px] px-3 rounded border text-[13px] font-medium transition-colors ${
                      active ? "bg-brand-pink text-white border-brand-pink" : "bg-white border-neutral-border text-neutral-muted hover:border-brand-pink"
                    }`}
                  >
                    {DAY_NAMES[day]}
                  </button>
                );
              })}
            </div>

            {availSlots.map((slot, idx) => (
              <div key={slot.dayOfWeek} className="grid grid-cols-4 gap-3 mb-3 items-center">
                <span className="text-[13px] font-bold text-neutral-dark">{DAY_NAMES[slot.dayOfWeek]}</span>
                <div>
                  <label className="block text-[11px] text-neutral-muted mb-0.5">Mulai</label>
                  <input type="time" value={slot.startTime}
                    onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                    className="w-full h-[36px] border border-neutral-border rounded-[4px] px-2 text-[13px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-muted mb-0.5">Selesai</label>
                  <input type="time" value={slot.endTime}
                    onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                    className="w-full h-[36px] border border-neutral-border rounded-[4px] px-2 text-[13px] focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-muted mb-0.5">Durasi Slot (mnt)</label>
                  <input type="number" value={slot.slotDurationMinutes ?? 30} min={10} max={120} step={5}
                    onChange={(e) => updateSlot(idx, "slotDurationMinutes", Number(e.target.value))}
                    className="w-full h-[36px] border border-neutral-border rounded-[4px] px-2 text-[13px] focus:outline-none focus:border-brand-pink" />
                </div>
              </div>
            ))}

            {availError && <p className="text-[13px] text-brand-pink mb-2">{availError}</p>}
            {availSuccess && <p className="text-[13px] text-green-600 mb-2">Jadwal disimpan.</p>}

            <button onClick={saveAvailability} disabled={savingAvail}
              className="mt-2 h-[40px] px-4 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60"
            >
              {savingAvail ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>

          {/* Block date */}
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <h3 className="text-[16px] font-bold text-neutral-dark mb-4">Blokir Tanggal Libur</h3>
            <form onSubmit={handleBlockDate} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-neutral-dark mb-1">Tanggal</label>
                <input type="date" value={blockDate} min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-neutral-dark mb-1">Alasan (opsional)</label>
                <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="mis. Sakit, pelatihan"
                  className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink" />
              </div>
              <button type="submit" disabled={blockingDate}
                className="h-[40px] px-4 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60 whitespace-nowrap"
              >
                {blockingDate ? "..." : "Blokir"}
              </button>
            </form>
            {blockError && <p className="text-[13px] text-brand-pink mt-2">{blockError}</p>}
            {blockSuccess && <p className="text-[13px] text-green-600 mt-2">Tanggal diblokir.</p>}
          </div>
        </div>

        {/* Right: Recent appointments */}
        <div>
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-neutral-dark">Janji Terakhir</h3>
              <Link href={`/admin/appointments?doctorId=${id}`}
                className="text-[13px] text-brand-pink font-bold hover:text-brand-pink-hover">
                Semua →
              </Link>
            </div>
            {appointments?.data.length === 0 && (
              <p className="text-[14px] text-neutral-muted">Belum ada janji.</p>
            )}
            <div className="divide-y divide-neutral-border">
              {appointments?.data.map((a) => (
                <div key={a.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-neutral-dark">{a.patientName}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ""}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral-muted mt-0.5">
                    {format(new Date(a.scheduledAt), "d MMM, HH:mm", { locale: idLocale })}
                    {" · "}{a.serviceName}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-neutral-border rounded-card shadow-card p-4 mt-4">
            <p className="text-[12px] text-neutral-muted">
              Bergabung: {format(new Date(doctor.createdAt), "d MMM yyyy", { locale: idLocale })}
            </p>
            <p className={`text-[12px] font-bold mt-1 ${doctor.isActive ? "text-green-600" : "text-neutral-muted"}`}>
              {doctor.isActive ? "Akun Aktif" : "Akun Nonaktif"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

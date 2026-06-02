"use client";

import { useState } from "react";
import Link from "next/link";
import { useDoctors } from "@/hooks/use-doctors";
import { useInviteDoctor } from "@/hooks/use-auth";

function InviteModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutateAsync: invite, isPending } = useInviteDoctor();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Nama wajib diisi."); return; }
    if (!email.trim()) { setError("Email wajib diisi."); return; }
    try {
      await invite({ name: name.trim(), email: email.trim(), phone: phone || undefined });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Gagal mengirim undangan.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-card border border-neutral-border shadow-card w-[440px] p-6">
        <h3 className="text-[18px] font-bold text-neutral-dark mb-5">Undang Dokter</h3>

        {success ? (
          <div>
            <div className="bg-[#E6F3EF] border border-[#045136] rounded-[8px] px-4 py-3 mb-4">
              <p className="text-[14px] text-[#045136] font-medium">
                Undangan berhasil dikirim ke <strong>{email}</strong>. Dokter akan menerima link untuk mengatur password.
              </p>
            </div>
            <button onClick={onClose}
              className="w-full h-[40px] text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover">
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Nama Lengkap</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="dr. Budi Santoso"
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dokter@email.com"
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-dark mb-1">No. HP (opsional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+628xx"
                className="w-full h-[40px] border border-neutral-border rounded-[4px] px-3 text-[14px] focus:outline-none focus:border-brand-pink focus:shadow-[0px_0px_0px_3px_rgba(224,0,77,0.1)]" />
            </div>
            {error && <p className="text-[13px] text-brand-pink">{error}</p>}
            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={onClose}
                className="h-[40px] px-4 text-[14px] font-bold border border-neutral-border rounded-btn hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={isPending}
                className="h-[40px] px-5 text-[14px] font-bold bg-brand-pink text-white rounded-btn hover:bg-brand-pink-hover disabled:opacity-60">
                {isPending ? "Mengirim..." : "Kirim Undangan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Dokter</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold hover:bg-brand-pink-hover"
        >
          + Undang Dokter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && (
          <p className="col-span-3 text-neutral-muted text-[14px]">Memuat...</p>
        )}
        {doctors?.map((doctor) => (
          <Link key={doctor.id} href={`/admin/doctors/${doctor.id}`}>
            <div className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:border-brand-pink hover:shadow-card-hover transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[16px] shrink-0">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-neutral-dark text-[14px] truncate">dr. {doctor.name}</p>
                  <p className="text-[12px] text-neutral-muted truncate">{doctor.specialization ?? "Dokter Umum"}</p>
                </div>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-neutral-muted">{doctor.yearsOfExperience} thn pengalaman</span>
                <span className={`font-bold ${doctor.isAcceptingPatients ? "text-green-600" : "text-neutral-muted"}`}>
                  {doctor.isAcceptingPatients ? "Menerima Pasien" : "Penuh"}
                </span>
              </div>
              {doctor.consultationFeeIDR && (
                <p className="text-[12px] text-neutral-dark mt-2 font-medium">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency", currency: "IDR", maximumFractionDigits: 0,
                  }).format(doctor.consultationFeeIDR)}/konsultasi
                </p>
              )}
            </div>
          </Link>
        ))}
        {!isLoading && (!doctors || doctors.length === 0) && (
          <div className="col-span-3 bg-white border border-neutral-border rounded-card shadow-card p-8 text-center">
            <p className="text-neutral-muted text-[14px] mb-3">Belum ada dokter terdaftar.</p>
            <button onClick={() => setShowInvite(true)}
              className="text-[14px] font-bold text-brand-pink hover:text-brand-pink-hover">
              Undang dokter pertama →
            </button>
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

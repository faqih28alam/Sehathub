"use client";

import { useDoctors } from "@/hooks/use-doctors";
import Link from "next/link";

export default function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-neutral-dark">Dokter</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {isLoading && (
          <p className="col-span-3 text-neutral-muted text-[14px]">Memuat...</p>
        )}
        {doctors?.map((doctor) => (
          <Link key={doctor.id} href={`/admin/doctors/${doctor.id}`}>
            <div className="bg-white border border-neutral-border rounded-card shadow-card p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-dark text-[14px]">{doctor.name}</p>
                  <p className="text-[12px] text-neutral-muted">{doctor.specialization ?? "Dokter Umum"}</p>
                </div>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-neutral-muted">{doctor.yearsOfExperience} tahun pengalaman</span>
                <span
                  className={`font-bold ${
                    doctor.isAcceptingPatients ? "text-green-600" : "text-neutral-muted"
                  }`}
                >
                  {doctor.isAcceptingPatients ? "Menerima Pasien" : "Penuh"}
                </span>
              </div>
              {doctor.consultationFeeIDR && (
                <p className="text-[12px] text-neutral-dark mt-1 font-medium">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(doctor.consultationFeeIDR)}
                  /konsultasi
                </p>
              )}
            </div>
          </Link>
        ))}
        {!isLoading && (!doctors || doctors.length === 0) && (
          <p className="col-span-3 text-neutral-muted text-[14px]">Belum ada dokter terdaftar</p>
        )}
      </div>
    </div>
  );
}

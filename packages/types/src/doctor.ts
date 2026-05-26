export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  bio: string | null;
  licenseNumber: string | null;
  yearsOfExperience: number;
  consultationFeeIDR: number | null;
  isAcceptingPatients: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDoctorDto {
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  consultationFeeIDR?: number;
  isAcceptingPatients?: boolean;
}

export interface DoctorAvailabilityDto {
  dayOfWeek: number; // 0=Sun ... 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes?: number;
}

export interface DoctorUnavailabilityDto {
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface TimeSlot {
  startTime: string; // ISO datetime
  endTime: string;
  available: boolean;
}

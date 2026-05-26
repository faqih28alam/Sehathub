export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentType = 'IN_PERSON' | 'TELECONSULT';

export interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  consultationNotes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  serviceId: string;
  scheduledAt: string; // ISO datetime
  type?: AppointmentType;
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
  consultationNotes?: string;
  cancellationReason?: string;
}

export interface AppointmentListQuery {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

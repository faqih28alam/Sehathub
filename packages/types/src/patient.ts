export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  passportId: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  medicalHistoryNotes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDto {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportId?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  medicalHistoryNotes?: string;
}

export interface UpdatePatientDto {
  name?: string;
  phone?: string;
  nationality?: string;
  passportId?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  medicalHistoryNotes?: string;
}

export interface PatientListQuery {
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

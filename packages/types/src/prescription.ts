export interface PrescriptionItemDto {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface CreatePrescriptionDto {
  appointmentId: string;
  notes?: string;
  items: PrescriptionItemDto[];
}

export interface PrescriptionItemRecord extends PrescriptionItemDto {
  id: string;
  prescriptionId: string;
}

export interface PrescriptionRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  notes: string | null;
  pdfUrl: string | null;
  issuedAt: Date;
  createdAt: Date;
  items: PrescriptionItemRecord[];
}

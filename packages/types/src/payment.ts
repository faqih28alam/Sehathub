export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'MIDTRANS' | 'STRIPE' | 'CASH' | 'BANK_TRANSFER';

export interface PaymentItem {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  amountIDR: number;
  amountUSD: number | null;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayOrderId: string | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  notes: string | null;
  invoiceNumber: string | null;
  createdAt: Date;
}

export interface CreatePaymentDto {
  appointmentId: string;
  method: PaymentMethod;
  promoCode?: string;
  currency?: 'IDR' | 'USD';
}

export interface RecordManualPaymentDto {
  appointmentId: string;
  method: 'CASH' | 'BANK_TRANSFER';
  amountIDR: number;
  notes?: string;
  promoCode?: string;
}

export interface MidtransChargeResponse {
  token: string;       // Snap token for frontend
  redirectUrl: string;
}

export interface StripeChargeResponse {
  clientSecret: string;
  paymentIntentId: string;
}

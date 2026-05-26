export type ServiceCategory =
  | 'GENERAL_CONSULTATION'
  | 'EMERGENCY'
  | 'PRESCRIPTION'
  | 'LAB_TEST'
  | 'SPECIALIST'
  | 'OTHER';

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  durationMinutes: number;
  priceIDR: number;
  priceUSD: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  category?: ServiceCategory;
  durationMinutes?: number;
  priceIDR: number;
  priceUSD?: number;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  category?: ServiceCategory;
  durationMinutes?: number;
  priceIDR?: number;
  priceUSD?: number;
  isActive?: boolean;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountPercent: number | null;
  discountIDR: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface CreatePromoCodeDto {
  code: string;
  discountPercent?: number;
  discountIDR?: number;
  maxUses?: number;
  expiresAt?: string;
}

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string; // userId
  tokenId: string; // RefreshToken.id for targeted revocation
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expiry
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
}

export interface InviteDoctorDto {
  email: string;
  name: string;
  phone?: string;
}

export interface AcceptInviteDto {
  password: string;
}

export interface RefreshDto {
  refreshToken?: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

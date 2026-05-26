import crypto from 'crypto';

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateTokenHint(rawToken: string): string {
  return crypto.createHmac('sha256', 'sehathub-hint').update(rawToken).digest('hex');
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

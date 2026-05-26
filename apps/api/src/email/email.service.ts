import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.getOrThrow('RESEND_API_KEY'));
    this.from = config.get('EMAIL_FROM', 'noreply@sehathub.id');
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Reset your SehatHub password',
      html: `<p>Hi ${name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 60 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    });
  }

  async sendDoctorInvite(to: string, name: string, inviteUrl: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: "You've been invited to join SehatHub",
      html: `<p>Hi ${name},</p><p>You've been invited to join SehatHub as a Doctor. Click <a href="${inviteUrl}">here</a> to set up your account. This link expires in 7 days.</p>`,
    });
  }
}

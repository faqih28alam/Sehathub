import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { generateSecureToken, addMinutes, addDays } from '@sehathub/utils';
import type { JwtPayload, JwtRefreshPayload, AuthTokens, AuthUser, Role } from '@sehathub/types';
import type { RegisterDto } from './dto/register.dto';
import type { InviteDoctorDto } from './dto/invite-doctor.dto';
import type { User } from '@sehathub/db';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async login(user: User) {
    const tokens = await this.issueTokens(user);
    return { tokens, user: this.sanitize(user) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash, role: 'PATIENT' },
    });

    const tokens = await this.issueTokens(user);
    return { tokens, user: this.sanitize(user) };
  }

  async refresh(userId: string, tokenId: string) {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async logout(tokenId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { id: tokenId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always succeed to prevent email enumeration
    if (!user) return;

    const rawToken = generateSecureToken();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const minutes = Number(this.config.get('PASSWORD_RESET_EXPIRES_MINUTES', '60'));
    const expiresAt = addMinutes(new Date(), minutes);

    await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${rawToken}`;
    await this.emailService.sendPasswordReset(user.email, user.name, resetUrl);
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const candidates = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });

    let matchedId: string | null = null;
    let matchedUserId: string | null = null;
    for (const c of candidates) {
      if (await bcrypt.compare(rawToken, c.tokenHash)) {
        matchedId = c.id;
        matchedUserId = c.userId;
        break;
      }
    }
    if (!matchedId || !matchedUserId) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { id: matchedId }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: matchedUserId }, data: { passwordHash } }),
      // Force re-login after password reset
      this.prisma.refreshToken.updateMany({
        where: { userId: matchedUserId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async inviteDoctor(dto: InviteDoctorDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const doctor = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone, role: 'DOCTOR', isActive: false },
    });

    const rawToken = generateSecureToken();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const days = Number(this.config.get('INVITE_TOKEN_EXPIRES_DAYS', '7'));
    const expiresAt = addDays(new Date(), days);

    await this.prisma.inviteToken.create({ data: { userId: doctor.id, tokenHash, expiresAt } });

    const inviteUrl = `${this.config.get('FRONTEND_URL')}/accept-invite?token=${rawToken}`;
    await this.emailService.sendDoctorInvite(doctor.email, doctor.name, inviteUrl);
  }

  async acceptInvite(rawToken: string, password: string) {
    const candidates = await this.prisma.inviteToken.findMany({
      where: { acceptedAt: null, expiresAt: { gt: new Date() } },
    });

    let matchedId: string | null = null;
    let matchedUserId: string | null = null;
    for (const c of candidates) {
      if (await bcrypt.compare(rawToken, c.tokenHash)) {
        matchedId = c.id;
        matchedUserId = c.userId;
        break;
      }
    }
    if (!matchedId || !matchedUserId) throw new BadRequestException('Invalid or expired invite');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.$transaction(async (tx) => {
      await tx.inviteToken.update({ where: { id: matchedId! }, data: { acceptedAt: new Date() } });
      return tx.user.update({ where: { id: matchedUserId! }, data: { passwordHash, isActive: true } });
    });

    const tokens = await this.issueTokens(user);
    return { tokens, user: this.sanitize(user) };
  }

  async validateRefreshToken(userId: string, tokenId: string, rawToken: string) {
    const token = await this.prisma.refreshToken.findFirst({
      where: { id: tokenId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!token) return false;
    return bcrypt.compare(rawToken, token.tokenHash);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role as Role };
    const accessToken = this.jwtService.sign(payload);

    const rawRefresh = generateSecureToken(48);
    const refreshHash = await bcrypt.hash(rawRefresh, 10);
    const expiresAt = addDays(new Date(), 7);

    const dbToken = await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refreshHash, expiresAt },
    });

    const refreshPayload: JwtRefreshPayload = { sub: user.id, tokenId: dbToken.id };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private sanitize(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

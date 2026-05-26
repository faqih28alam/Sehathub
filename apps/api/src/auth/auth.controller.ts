import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InviteDoctorDto } from './dto/invite-doctor.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import type { User } from '@sehathub/db';
import type { AuthTokens } from '@sehathub/types';

const REFRESH_COOKIE = 'refresh_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(user);
    this.setRefreshCookie(res, result.tokens.refreshToken);
    return { success: true, data: { accessToken: result.tokens.accessToken, user: result.user } };
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.tokens.refreshToken);
    return { success: true, data: { accessToken: result.tokens.accessToken, user: result.user } };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() payload: { userId: string; tokenId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(payload.userId, payload.tokenId);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { success: true, data: { accessToken: tokens.accessToken } };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(
    @CurrentUser() payload: { userId: string; tokenId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(payload.tokenId);
    res.clearCookie(REFRESH_COOKIE);
    return { success: true };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, message: 'If that email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(token, dto.password);
    return { success: true, message: 'Password reset successfully' };
  }

  @Post('invite')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @UseGuards(RolesGuard)
  async inviteDoctor(@Body() dto: InviteDoctorDto) {
    await this.authService.inviteDoctor(dto);
    return { success: true, message: 'Invite sent' };
  }

  @Public()
  @Post('accept-invite/:token')
  async acceptInvite(
    @Param('token') token: string,
    @Body() dto: AcceptInviteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.acceptInvite(token, dto.password);
    this.setRefreshCookie(res, result.tokens.refreshToken);
    return { success: true, data: { accessToken: result.tokens.accessToken, user: result.user } };
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    return { success: true, data: user };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEVEN_DAYS_MS,
      path: '/api/v1/auth/refresh',
    });
  }
}

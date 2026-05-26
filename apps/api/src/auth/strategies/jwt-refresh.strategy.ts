import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import type { JwtRefreshPayload } from '@sehathub/types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies as Record<string, string>)?.refresh_token ?? null,
        ExtractJwt.fromBodyField('refreshToken'),
      ]),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const cookies = req.cookies as Record<string, string>;
    const body = req.body as Record<string, string>;
    const rawToken = cookies?.refresh_token ?? body?.refreshToken;

    const isValid = await this.authService.validateRefreshToken(
      payload.sub,
      payload.tokenId,
      rawToken,
    );
    if (!isValid) throw new UnauthorizedException('Invalid or revoked refresh token');

    return { userId: payload.sub, tokenId: payload.tokenId };
  }
}

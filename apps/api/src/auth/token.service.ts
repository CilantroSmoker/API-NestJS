import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AuthUser } from './roles';

type TokenPayload = AuthUser & {
  iat: number;
  exp: number;
};

@Injectable()
export class TokenService {
  private readonly expiresInSeconds = Number(process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 8);
  private readonly jwtSecret = this.resolveJwtSecret();

  sign(user: AuthUser) {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      ...user,
      iat: now,
      exp: now + this.expiresInSeconds,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.signData(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): TokenPayload {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) throw new UnauthorizedException('Token invalido');

    const expectedSignature = this.signData(`${header}.${payload}`);
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      throw new UnauthorizedException('Token invalido');
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Sesion expirada');
    }
    return data;
  }

  private signData(data: string) {
    return createHmac('sha256', this.jwtSecret).update(data).digest('base64url');
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private resolveJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
      throw new Error('JWT_SECRET no esta definido. Configuralo en apps/api/.env antes de iniciar la API.');
    }
    return secret;
  }
}

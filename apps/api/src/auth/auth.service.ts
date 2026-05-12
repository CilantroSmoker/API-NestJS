import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthUser } from './roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!usuario || !usuario.activo) throw new UnauthorizedException('Credenciales invalidas');

    const passwordOk = await this.passwordService.verify(dto.password, usuario.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Credenciales invalidas');

    const user = this.toAuthUser(usuario);
    return { accessToken: this.tokenService.sign(user), user };
  }

  me(user: AuthUser) {
    return user;
  }

  private toAuthUser(usuario: any): AuthUser {
    return {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };
  }
}

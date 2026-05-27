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
      include: this.usuarioInclude,
    });

    if (!usuario || !usuario.activo) throw new UnauthorizedException('Credenciales invalidas');

    const passwordOk = await this.passwordService.verify(dto.password, usuario.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Credenciales invalidas');

    const user = this.toAuthUser(usuario);
    return { accessToken: this.tokenService.sign(user), user };
  }

  async me(user: AuthUser) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: this.usuarioInclude,
    });

    if (!usuario || !usuario.activo) throw new UnauthorizedException('Debe iniciar sesion');
    return this.toAuthUser(usuario);
  }

  private readonly usuarioInclude = {
    rol: {
      include: {
        permisos: {
          include: { permiso: true },
        },
      },
    },
  };

  private toAuthUser(usuario: any): AuthUser {
    return {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol.codigo,
      permisos: usuario.rol.permisos.map((rolPermiso: any) => rolPermiso.permiso.codigo),
    };
  }
}

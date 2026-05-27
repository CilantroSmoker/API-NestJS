import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TokenService } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    const [type, token] = authHeader?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Debe iniciar sesion');

    const payload = this.tokenService.verify(token);
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.activo) throw new UnauthorizedException('Debe iniciar sesion');

    request.user = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol.codigo,
      permisos: usuario.rol.permisos.map((rolPermiso) => rolPermiso.permiso.codigo),
    };
    return true;
  }
}

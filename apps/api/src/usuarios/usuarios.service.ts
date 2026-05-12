import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Ya existe un usuario con ese email');

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre.trim(),
        email,
        passwordHash: await this.passwordService.hash(dto.password),
        rol: dto.rol,
        activo: dto.activo ?? true,
      },
    });
    return this.toResponse(usuario);
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      orderBy: [{ rol: 'desc' }, { nombre: 'asc' }],
    });
    return usuarios.map((usuario) => this.toResponse(usuario));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.toResponse(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const current = await this.prisma.usuario.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Usuario #${id} no encontrado`);
    const data: Record<string, unknown> = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      const exists = await this.prisma.usuario.findUnique({ where: { email } });
      if (exists && exists.id !== id) throw new ConflictException('Ya existe un usuario con ese email');
      data.email = email;
    }
    if (dto.password) data.passwordHash = await this.passwordService.hash(dto.password);
    if (dto.rol !== undefined) data.rol = dto.rol;
    if (dto.activo !== undefined) data.activo = dto.activo;

    const keepsActiveSuperAdmin =
      (dto.rol ?? current.rol) === 'SUPER_ADMIN' && (dto.activo ?? current.activo) === true;
    if (current.rol === 'SUPER_ADMIN' && !keepsActiveSuperAdmin) {
      const otherSuperAdmins = await this.prisma.usuario.count({
        where: { rol: 'SUPER_ADMIN', activo: true, NOT: { id } },
      });
      if (otherSuperAdmins === 0) {
        throw new BadRequestException('Debe existir al menos un super admin activo');
      }
    }

    const usuario = await this.prisma.usuario.update({ where: { id }, data });
    return this.toResponse(usuario);
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) throw new BadRequestException('No puede eliminar su propio usuario');
    await this.findOne(id);

    const superAdmins = await this.prisma.usuario.count({
      where: { rol: 'SUPER_ADMIN', activo: true, NOT: { id } },
    });
    const target = await this.prisma.usuario.findUnique({ where: { id } });
    if (target?.rol === 'SUPER_ADMIN' && superAdmins === 0) {
      throw new BadRequestException('Debe existir al menos un super admin activo');
    }

    return this.toResponse(await this.prisma.usuario.delete({ where: { id } }));
  }

  private toResponse(usuario: any) {
    const { passwordHash, ...safeUsuario } = usuario;
    return safeUsuario;
  }
}

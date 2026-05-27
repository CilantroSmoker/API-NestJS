import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { AuthUser, ROLES, RolUsuario } from '../auth/roles';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUsuarioDto, currentUser: AuthUser) {
    this.ensureCanAssignRole(currentUser, dto.rol);

    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Ya existe un usuario con ese email');

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre.trim(),
        email,
        passwordHash: await this.passwordService.hash(dto.password),
        pinAutorizacionHash: dto.pinAutorizacion ? await this.passwordService.hash(dto.pinAutorizacion) : undefined,
        rol: { connect: { codigo: dto.rol } },
        activo: dto.activo ?? true,
      },
      include: this.usuarioInclude,
    });
    return this.toResponse(usuario);
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      include: this.usuarioInclude,
      orderBy: [{ rol: { codigo: 'desc' } }, { nombre: 'asc' }],
    });
    return usuarios.map((usuario) => this.toResponse(usuario));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, include: this.usuarioInclude });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.toResponse(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto, currentUser: AuthUser) {
    const current = await this.prisma.usuario.findUnique({ where: { id }, include: this.usuarioInclude });
    if (!current) throw new NotFoundException(`Usuario #${id} no encontrado`);
    this.ensureCanModifySuperAdmin(currentUser, current.rol.codigo as RolUsuario, dto.rol);

    const data: Record<string, unknown> = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      const exists = await this.prisma.usuario.findUnique({ where: { email } });
      if (exists && exists.id !== id) throw new ConflictException('Ya existe un usuario con ese email');
      data.email = email;
    }
    if (dto.password) data.passwordHash = await this.passwordService.hash(dto.password);
    if (dto.pinAutorizacion) data.pinAutorizacionHash = await this.passwordService.hash(dto.pinAutorizacion);
    if (dto.rol !== undefined) data.rol = { connect: { codigo: dto.rol } };
    if (dto.activo !== undefined) data.activo = dto.activo;

    const nextRol = dto.rol ?? current.rol.codigo;
    const keepsActiveSuperAdmin =
      nextRol === ROLES.SUPER_ADMIN && (dto.activo ?? current.activo) === true;
    if (current.rol.codigo === ROLES.SUPER_ADMIN && !keepsActiveSuperAdmin) {
      const otherSuperAdmins = await this.prisma.usuario.count({
        where: { rol: { codigo: ROLES.SUPER_ADMIN }, activo: true, NOT: { id } },
      });
      if (otherSuperAdmins === 0) {
        throw new BadRequestException('Debe existir al menos un super admin activo');
      }
    }

    const usuario = await this.prisma.usuario.update({ where: { id }, data, include: this.usuarioInclude });
    return this.toResponse(usuario);
  }

  async remove(id: number, currentUser: AuthUser) {
    if (id === currentUser.sub) throw new BadRequestException('No puede eliminar su propio usuario');
    await this.findOne(id);

    const superAdmins = await this.prisma.usuario.count({
      where: { rol: { codigo: ROLES.SUPER_ADMIN }, activo: true, NOT: { id } },
    });
    const target = await this.prisma.usuario.findUnique({ where: { id }, include: this.usuarioInclude });
    if (target) this.ensureCanModifySuperAdmin(currentUser, target.rol.codigo as RolUsuario);
    if (target?.rol.codigo === ROLES.SUPER_ADMIN && superAdmins === 0) {
      throw new BadRequestException('Debe existir al menos un super admin activo');
    }

    return this.toResponse(await this.prisma.usuario.delete({ where: { id }, include: this.usuarioInclude }));
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

  private toResponse(usuario: any) {
    const { passwordHash, pinAutorizacionHash, rolId, rol, ...safeUsuario } = usuario;
    return {
      ...safeUsuario,
      rol: rol.codigo as RolUsuario,
      permisos: rol.permisos.map((rolPermiso: any) => rolPermiso.permiso.codigo),
    };
  }

  private ensureCanAssignRole(currentUser: AuthUser, role: RolUsuario) {
    if (role === ROLES.SUPER_ADMIN && currentUser.rol !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenException('Solo un super admin puede asignar el rol super admin');
    }
  }

  private ensureCanModifySuperAdmin(currentUser: AuthUser, currentRole: RolUsuario, nextRole?: RolUsuario) {
    const touchesSuperAdmin = currentRole === ROLES.SUPER_ADMIN || nextRole === ROLES.SUPER_ADMIN;
    if (touchesSuperAdmin && currentUser.rol !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenException('Solo un super admin puede modificar usuarios super admin');
    }
  }
}

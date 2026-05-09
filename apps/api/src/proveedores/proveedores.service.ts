import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data: dto });
  }

  async findAll(nombre?: string) {
    return this.prisma.proveedor.findMany({
      where: nombre ? { nombre: { contains: nombre, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: { productos: true },
    });
    if (!proveedor) throw new NotFoundException(`Proveedor #${id} no encontrado`);
    return proveedor;
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.findOne(id);
    return this.prisma.proveedor.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);
    if (proveedor.productos.length > 0) {
      throw new ConflictException('No se puede eliminar un proveedor con productos asociados');
    }
    return this.prisma.proveedor.delete({ where: { id } });
  }
}

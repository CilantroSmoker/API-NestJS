import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto) {
    const existe = await this.prisma.categoria.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`La categoría "${dto.nombre}" ya existe`);
    return this.prisma.categoria.create({ data: dto });
  }

  async findAll(nombre?: string) {
    return this.prisma.categoria.findMany({
      where: nombre ? { nombre: { contains: nombre, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { productos: true },
    });
    if (!categoria) throw new NotFoundException(`Categoría #${id} no encontrada`);
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    if (categoria.productos.length > 0) {
      throw new ConflictException('No se puede eliminar una categoria con productos asociados');
    }
    return this.prisma.categoria.delete({ where: { id } });
  }
}

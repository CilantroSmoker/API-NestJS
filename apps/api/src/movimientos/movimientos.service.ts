import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto, TipoMovimiento } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMovimientoDto) {
  const producto = await this.prisma.producto.findUnique({ where: { id: dto.productoId } });
  if (!producto) throw new NotFoundException(`Producto #${dto.productoId} no encontrado`);

  let stockDespues: number;
  if (dto.tipo === TipoMovimiento.ENTRADA) {
    stockDespues = producto.stock + dto.cantidad;
  } else if (dto.tipo === TipoMovimiento.SALIDA) {
    if (producto.stock < dto.cantidad) throw new BadRequestException('Stock insuficiente');
    stockDespues = producto.stock - dto.cantidad;
  } else {
    stockDespues = dto.cantidad; // AJUSTE
  }

  return this.prisma.$transaction(async (tx) => {
    const movimiento = await tx.movimiento.create({
      data: {
        productoId: dto.productoId,
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        motivo: dto.motivo,
        stockAntes: producto.stock,
        stockDespues,
      },
    });

    await tx.producto.update({
      where: { id: dto.productoId },
      data: { stock: stockDespues },
    });

    return movimiento;
  });
}

  async findAll(productoId?: number) {
    return this.prisma.movimiento.findMany({
      where: productoId ? { productoId } : undefined,
      include: { producto: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const mov = await this.prisma.movimiento.findUnique({
      where: { id },
      include: { producto: true },
    });
    if (!mov) throw new NotFoundException(`Movimiento #${id} no encontrado`);
    return mov;
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';


@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVentaDto) {
    // Verificar stock y calcular totales
    let total = 0;
    let descuentoTotal = 0;
    const detallesData: any[] = [];

    for (const detalle of dto.detalles) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: detalle.productoId },
        include: { categoria: true },
      });
      if (!producto) throw new NotFoundException(`Producto #${detalle.productoId} no encontrado`);
      if (producto.stock < detalle.cantidad) {
        throw new BadRequestException(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
      }

      const descuento = Math.min(producto.descuento + producto.categoria.descuento, 100);
      const precioFinal = +(producto.precio * (1 - descuento / 100)).toFixed(2);
      const subtotal = +(precioFinal * detalle.cantidad).toFixed(2);
      const descuentoMonto = +(producto.precio * (descuento / 100) * detalle.cantidad).toFixed(2);

      total += subtotal;
      descuentoTotal += descuentoMonto;

      detallesData.push({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnit: producto.precio,
        descuento,
        subtotal,
        producto,
      });
    }

    // Crear venta + detalles + movimientos en transacción
    return this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          total: +total.toFixed(2),
          descuentoTotal: +descuentoTotal.toFixed(2),
          detalles: {
            create: detallesData.map(({ producto, ...d }) => d),
          },
        },
        include: { detalles: { include: { producto: true } } },
      });

      // Descontar stock y crear movimientos
      for (const d of detallesData) {
        await tx.producto.update({
          where: { id: d.productoId },
          data: { stock: { decrement: d.cantidad } },
        });
        await tx.movimiento.create({
          data: {
            productoId: d.productoId,
            tipo: 'SALIDA',
            cantidad: d.cantidad,
            motivo: `Venta #${venta.id}`,
            stockAntes: d.producto.stock,
            stockDespues: d.producto.stock - d.cantidad,
          },
        });
      }

      return venta;
    });
  }

  async findAll() {
    return this.prisma.venta.findMany({
      include: { detalles: { include: { producto: { select: { nombre: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: { detalles: { include: { producto: true } } },
    });
    if (!venta) throw new NotFoundException(`Venta #${id} no encontrada`);
    return venta;
  }

  async remove(id: number) {
    const venta = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      for (const detalle of venta.detalles) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stock: { increment: detalle.cantidad } },
        });
      }

      await tx.movimiento.deleteMany({
        where: { motivo: `Venta #${id}` },
      });

      await tx.detalleVenta.deleteMany({
        where: { ventaId: id },
      });

      return tx.venta.delete({
        where: { id },
      });
    });
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductoDto) {
    await this.validarRelaciones(dto.categoriaId, dto.proveedorId);
    return this.prisma.producto.create({
      data: dto,
      include: { categoria: true, proveedor: true },
    });
  }

  async findAll(filters: { nombre?: string; categoriaId?: number; proveedorId?: number; stockBajo?: boolean }) {
    const { nombre, categoriaId, proveedorId, stockBajo } = filters;

    const productos = await this.prisma.producto.findMany({
      where: {
        ...(nombre && { nombre: { contains: nombre, mode: 'insensitive' } }),
        ...(categoriaId && { categoriaId }),
        ...(proveedorId && { proveedorId }),
      },
      include: { categoria: true, proveedor: true },
      orderBy: { nombre: 'asc' },
    });

    // Filtrar stock bajo en memoria para adjuntar alerta
    return productos
      .filter(p => !stockBajo || p.stock <= p.stockMinimo)
      .map(p => ({
        ...p,
        alertaStockBajo: p.stock <= p.stockMinimo,
        precioConDescuento: this.calcularPrecioFinal(p.precio, p.descuento, p.categoria.descuento),
      }));
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true, proveedor: true, movimientos: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return {
      ...producto,
      alertaStockBajo: producto.stock <= producto.stockMinimo,
      precioConDescuento: this.calcularPrecioFinal(producto.precio, producto.descuento, producto.categoria.descuento),
    };
  }

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);
    if (dto.categoriaId || dto.proveedorId) {
      await this.validarRelaciones(dto.categoriaId, dto.proveedorId);
    }
    return this.prisma.producto.update({
      where: { id },
      data: dto,
      include: { categoria: true, proveedor: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.delete({ where: { id } });
  }

  async getStockBajo() {
    const productos = await this.prisma.producto.findMany({
      where: { stock: { lte: this.prisma.producto.fields.stockMinimo } },
      include: { categoria: true, proveedor: true },
    });
    // Filtrar en JS ya que lte con campo relativo no es directo en Prisma
    const raw = await this.prisma.producto.findMany({ include: { categoria: true, proveedor: true } });
    return raw.filter(p => p.stock <= p.stockMinimo).map(p => ({
      ...p,
      alertaStockBajo: true,
      precioConDescuento: this.calcularPrecioFinal(p.precio, p.descuento, p.categoria.descuento),
    }));
  }

  private calcularPrecioFinal(precio: number, descuentoProducto: number, descuentoCategoria: number): number {
    const descuentoTotal = Math.min(descuentoProducto + descuentoCategoria, 100);
    return +(precio * (1 - descuentoTotal / 100)).toFixed(2);
  }

  private async validarRelaciones(categoriaId?: number, proveedorId?: number) {
    if (categoriaId) {
      const cat = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
      if (!cat) throw new BadRequestException(`Categoría #${categoriaId} no existe`);
    }
    if (proveedorId) {
      const prov = await this.prisma.proveedor.findUnique({ where: { id: proveedorId } });
      if (!prov) throw new BadRequestException(`Proveedor #${proveedorId} no existe`);
    }
  }
}
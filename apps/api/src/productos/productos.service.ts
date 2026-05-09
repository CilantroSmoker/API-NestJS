import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

type ProductoFilters = {
  q?: string;
  categoriaId?: number;
  proveedorId?: number;
  stockBajo?: boolean;
  precioMin?: number;
  precioMax?: number;
  stockMin?: number;
  stockMax?: number;
  page?: number;
  limit?: number;
};

type ProductoSearchRow = {
  id: number;
  codigoBarra: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  stockMinimo: number;
  descuento: number;
  categoriaId: number;
  proveedorId: number;
  createdAt: Date;
  updatedAt: Date;
  categoriaNombre: string;
  categoriaDescuento: number;
  proveedorNombre: string;
  total: bigint;
};

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductoDto) {
    await this.validarRelaciones(dto.categoriaId, dto.proveedorId);
    const data = { ...dto, codigoBarra: this.normalizarCodigoBarra(dto.codigoBarra) };
    return this.prisma.producto.create({
      data,
      include: { categoria: true, proveedor: true },
    });
  }

  async findAll(filters: ProductoFilters) {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 48, 1), 100);
    const rows = await this.buscarProductos({ ...filters, page, limit });
    const total = rows[0] ? Number(rows[0].total) : 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const items = rows.map((p) => ({
      id: p.id,
      codigoBarra: p.codigoBarra,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      descuento: p.descuento,
      categoriaId: p.categoriaId,
      proveedorId: p.proveedorId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      categoria: { id: p.categoriaId, nombre: p.categoriaNombre, descuento: p.categoriaDescuento },
      proveedor: { id: p.proveedorId, nombre: p.proveedorNombre },
      alertaStockBajo: p.stock <= p.stockMinimo,
      precioConDescuento: this.calcularPrecioFinal(p.precio, p.descuento, p.categoriaDescuento),
    }));

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
    const data = { ...dto, codigoBarra: this.normalizarCodigoBarra(dto.codigoBarra) };
    return this.prisma.producto.update({
      where: { id },
      data,
      include: { categoria: true, proveedor: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const [ventas, movimientos] = await Promise.all([
      this.prisma.detalleVenta.count({ where: { productoId: id } }),
      this.prisma.movimiento.count({ where: { productoId: id } }),
    ]);

    if (ventas > 0 || movimientos > 0) {
      throw new ConflictException('No se puede eliminar un producto con ventas o movimientos asociados');
    }

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

  private async buscarProductos(filters: ProductoFilters) {
    const conditions: Prisma.Sql[] = [];
    const q = filters.q?.trim();
    const numericQ = q && /^\d+$/.test(q) ? Number(q) : undefined;
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 48, 1), 100);
    const offset = (page - 1) * limit;

    if (q) {
      conditions.push(Prisma.sql`(
        p.nombre % ${q}
        OR p.nombre ILIKE ${`%${q}%`}
        OR p."codigoBarra" = ${q}
        OR (${numericQ ?? null}::int IS NOT NULL AND p.id = ${numericQ ?? null})
      )`);
    }
    if (filters.categoriaId) conditions.push(Prisma.sql`p."categoriaId" = ${filters.categoriaId}`);
    if (filters.proveedorId) conditions.push(Prisma.sql`p."proveedorId" = ${filters.proveedorId}`);
    if (filters.precioMin !== undefined) conditions.push(Prisma.sql`p.precio >= ${filters.precioMin}`);
    if (filters.precioMax !== undefined) conditions.push(Prisma.sql`p.precio <= ${filters.precioMax}`);
    if (filters.stockMin !== undefined) conditions.push(Prisma.sql`p.stock >= ${filters.stockMin}`);
    if (filters.stockMax !== undefined) conditions.push(Prisma.sql`p.stock <= ${filters.stockMax}`);
    if (filters.stockBajo) conditions.push(Prisma.sql`p.stock <= p."stockMinimo"`);

    const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
    const orderBy = q
      ? Prisma.sql`ORDER BY similarity(p.nombre, ${q}) DESC, p.nombre ASC`
      : Prisma.sql`ORDER BY p.nombre ASC`;

    return this.prisma.$queryRaw<ProductoSearchRow[]>(Prisma.sql`
      SELECT
        p.id,
        p."codigoBarra",
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p."stockMinimo",
        p.descuento,
        p."categoriaId",
        p."proveedorId",
        p."createdAt",
        p."updatedAt",
        c.nombre AS "categoriaNombre",
        c.descuento AS "categoriaDescuento",
        pr.nombre AS "proveedorNombre",
        COUNT(*) OVER() AS total
      FROM "Producto" p
      INNER JOIN "Categoria" c ON c.id = p."categoriaId"
      INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
      ${where}
      ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}
    `);
  }

  private normalizarCodigoBarra(codigoBarra?: string | null) {
    const value = codigoBarra?.trim();
    return value ? value : undefined;
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

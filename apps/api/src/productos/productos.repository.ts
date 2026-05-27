import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

export type ProductoFilters = {
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

export type ProductoSearchRow = {
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

const productoInclude = {
  categoria: true,
  proveedor: true,
} satisfies Prisma.ProductoInclude;

@Injectable()
export class ProductosRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductoDto & { codigoBarra?: string }) {
    return this.prisma.producto.create({ data, include: productoInclude });
  }

  findById(id: number) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        ...productoInclude,
        movimientos: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  update(id: number, data: UpdateProductoDto & { codigoBarra?: string }) {
    return this.prisma.producto.update({ where: { id }, data, include: productoInclude });
  }

  delete(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }

  findCategoria(id: number) {
    return this.prisma.categoria.findUnique({ where: { id } });
  }

  findProveedor(id: number) {
    return this.prisma.proveedor.findUnique({ where: { id } });
  }

  countVentasByProducto(id: number) {
    return this.prisma.detalleVenta.count({ where: { productoId: id } });
  }

  countMovimientosByProducto(id: number) {
    return this.prisma.movimiento.count({ where: { productoId: id } });
  }

  findAllForStockBajo() {
    return this.prisma.producto.findMany({ include: productoInclude });
  }

  async findPaginated(filters: ProductoFilters, page: number, limit: number) {
    const where = this.buildWhere(filters);
    const skip = (page - 1) * limit;
    const take = limit;

    const [items, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        include: productoInclude,
        orderBy: { nombre: 'asc' },
        skip,
        take,
      }),
      this.prisma.producto.count({ where }),
    ]);

    return { items, total };
  }

  searchWithRawSql(filters: ProductoFilters, page: number, limit: number) {
    const conditions: Prisma.Sql[] = [];
    const q = filters.q?.trim();
    const numericQ = q && /^\d+$/.test(q) ? Number(q) : undefined;
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

  private buildWhere(filters: ProductoFilters): Prisma.ProductoWhereInput {
    return {
      categoriaId: filters.categoriaId,
      proveedorId: filters.proveedorId,
      precio: {
        gte: filters.precioMin,
        lte: filters.precioMax,
      },
      stock: {
        gte: filters.stockMin,
        lte: filters.stockMax,
      },
    };
  }
}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosRepository, ProductoFilters, ProductoSearchRow } from './productos.repository';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async create(dto: CreateProductoDto) {
    await this.validarRelaciones(dto.categoriaId, dto.proveedorId);
    const data = { ...dto, codigoBarra: this.normalizarCodigoBarra(dto.codigoBarra) };
    return this.productosRepository.create(data);
  }

  async findAll(filters: ProductoFilters) {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 48, 1), 100);
    const normalizedFilters = { ...filters, page, limit };

    const { items, total } = this.requiresSqlSearch(normalizedFilters)
      ? await this.findWithRawSearch(normalizedFilters, page, limit)
      : await this.productosRepository.findPaginated(normalizedFilters, page, limit);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      items: items.map((producto) => ({
        ...producto,
        alertaStockBajo: producto.stock <= producto.stockMinimo,
        precioConDescuento: this.calcularPrecioFinal(
          producto.precio,
          producto.descuento,
          producto.categoria.descuento,
        ),
      })),
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
    const producto = await this.productosRepository.findById(id);
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
    return this.productosRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);
    const [ventas, movimientos] = await Promise.all([
      this.productosRepository.countVentasByProducto(id),
      this.productosRepository.countMovimientosByProducto(id),
    ]);

    if (ventas > 0 || movimientos > 0) {
      throw new ConflictException('No se puede eliminar un producto con ventas o movimientos asociados');
    }

    return this.productosRepository.delete(id);
  }

  async getStockBajo() {
    const raw = await this.productosRepository.findAllForStockBajo();
    return raw.filter((p) => p.stock <= p.stockMinimo).map((p) => ({
      ...p,
      alertaStockBajo: true,
      precioConDescuento: this.calcularPrecioFinal(p.precio, p.descuento, p.categoria.descuento),
    }));
  }

  private calcularPrecioFinal(precio: number, descuentoProducto: number, descuentoCategoria: number): number {
    const descuentoTotal = Math.min(descuentoProducto + descuentoCategoria, 100);
    return +(precio * (1 - descuentoTotal / 100)).toFixed(2);
  }

  private requiresSqlSearch(filters: ProductoFilters) {
    return Boolean(filters.q?.trim() || filters.stockBajo);
  }

  private async findWithRawSearch(filters: ProductoFilters, page: number, limit: number) {
    const rows = await this.productosRepository.searchWithRawSql(filters, page, limit);
    return {
      items: rows.map((producto) => this.mapRawSearchRow(producto)),
      total: rows[0] ? Number(rows[0].total) : 0,
    };
  }

  private mapRawSearchRow(producto: ProductoSearchRow) {
    return {
      id: producto.id,
      codigoBarra: producto.codigoBarra,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      descuento: producto.descuento,
      categoriaId: producto.categoriaId,
      proveedorId: producto.proveedorId,
      createdAt: producto.createdAt,
      updatedAt: producto.updatedAt,
      categoria: {
        id: producto.categoriaId,
        nombre: producto.categoriaNombre,
        descuento: producto.categoriaDescuento,
      },
      proveedor: {
        id: producto.proveedorId,
        nombre: producto.proveedorNombre,
      },
    };
  }

  private normalizarCodigoBarra(codigoBarra?: string | null) {
    const value = codigoBarra?.trim();
    return value ? value : undefined;
  }

  private async validarRelaciones(categoriaId?: number, proveedorId?: number) {
    if (categoriaId) {
      const cat = await this.productosRepository.findCategoria(categoriaId);
      if (!cat) throw new BadRequestException(`Categoria #${categoriaId} no existe`);
    }
    if (proveedorId) {
      const prov = await this.productosRepository.findProveedor(proveedorId);
      if (!prov) throw new BadRequestException(`Proveedor #${proveedorId} no existe`);
    }
  }
}

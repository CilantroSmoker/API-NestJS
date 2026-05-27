import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimiento } from '../movimientos/dto/create-movimiento.dto';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Producto #1 no encontrado' })
  message!: string | string[];

  @ApiPropertyOptional({ example: 'Not Found' })
  error?: string;
}

export class CountProductosDto {
  @ApiProperty({ example: 120 })
  productos!: number;
}

export class CategoriaResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Bebidas' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Bebidas gaseosas, jugos y aguas', nullable: true })
  descripcion?: string | null;

  @ApiProperty({ example: 0 })
  descuento!: number;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  updatedAt!: string;
}

export class CategoriaListItemDto extends CategoriaResponseDto {
  @ApiProperty({ type: CountProductosDto })
  _count!: CountProductosDto;
}

export class ProductoLiteDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiPropertyOptional({ example: '7801000000016', nullable: true })
  codigoBarra?: string | null;

  @ApiProperty({ example: 'Coca Cola 1.5 L' })
  nombre!: string;

  @ApiProperty({ example: 1990 })
  precio!: number;

  @ApiProperty({ example: 50 })
  stock!: number;

  @ApiProperty({ example: 1 })
  categoriaId!: number;

  @ApiProperty({ example: 1 })
  proveedorId!: number;
}

export class CategoriaDetailDto extends CategoriaResponseDto {
  @ApiProperty({ type: [ProductoLiteDto] })
  productos!: ProductoLiteDto[];
}

export class ProveedorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Distribuidora Central' })
  nombre!: string;

  @ApiPropertyOptional({ example: '+56940001001', nullable: true })
  telefono?: string | null;

  @ApiPropertyOptional({ example: 'contacto.central@example.com', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Av. Principal 1200, Santiago', nullable: true })
  direccion?: string | null;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  updatedAt!: string;
}

export class ProveedorListItemDto extends ProveedorResponseDto {
  @ApiProperty({ type: CountProductosDto })
  _count!: CountProductosDto;
}

export class ProveedorDetailDto extends ProveedorResponseDto {
  @ApiProperty({ type: [ProductoLiteDto] })
  productos!: ProductoLiteDto[];
}

export class ProductoCategoriaDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Bebidas' })
  nombre!: string;

  @ApiProperty({ example: 0 })
  descuento!: number;
}

export class ProductoProveedorDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Distribuidora Central' })
  nombre!: string;
}

export class ProductoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiPropertyOptional({ example: '7801000000016', nullable: true })
  codigoBarra?: string | null;

  @ApiProperty({ example: 'Coca Cola 1.5 L' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Bebida gaseosa familiar', nullable: true })
  descripcion?: string | null;

  @ApiProperty({ example: 1990 })
  precio!: number;

  @ApiProperty({ example: 50 })
  stock!: number;

  @ApiProperty({ example: 5 })
  stockMinimo!: number;

  @ApiProperty({ example: 0 })
  descuento!: number;

  @ApiProperty({ example: 1 })
  categoriaId!: number;

  @ApiProperty({ example: 1 })
  proveedorId!: number;

  @ApiProperty({ type: ProductoCategoriaDto })
  categoria!: ProductoCategoriaDto;

  @ApiProperty({ type: ProductoProveedorDto })
  proveedor!: ProductoProveedorDto;

  @ApiProperty({ example: false })
  alertaStockBajo!: boolean;

  @ApiProperty({ example: 1990 })
  precioConDescuento!: number;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  updatedAt!: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 48 })
  limit!: number;

  @ApiProperty({ example: 10000 })
  total!: number;

  @ApiProperty({ example: 209 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;
}

export class ProductosPaginatedResponseDto {
  @ApiProperty({ type: [ProductoResponseDto] })
  items!: ProductoResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class MovimientoProductoDto {
  @ApiProperty({ example: 'Coca Cola 1.5 L' })
  nombre!: string;
}

export class MovimientoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  productoId!: number;

  @ApiProperty({ enum: TipoMovimiento, example: TipoMovimiento.ENTRADA })
  tipo!: TipoMovimiento;

  @ApiProperty({ example: 10 })
  cantidad!: number;

  @ApiPropertyOptional({ example: 'Reposicion de stock', nullable: true })
  motivo?: string | null;

  @ApiProperty({ example: 20 })
  stockAntes!: number;

  @ApiProperty({ example: 30 })
  stockDespues!: number;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiPropertyOptional({ type: MovimientoProductoDto })
  producto?: MovimientoProductoDto;
}

export class VentaProductoDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Coca Cola 1.5 L' })
  nombre!: string;
}

export class DetalleVentaResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  ventaId!: number;

  @ApiProperty({ example: 1 })
  productoId!: number;

  @ApiProperty({ example: 2 })
  cantidad!: number;

  @ApiProperty({ example: 1990 })
  precioUnit!: number;

  @ApiProperty({ example: 0 })
  descuento!: number;

  @ApiProperty({ example: 3980 })
  subtotal!: number;

  @ApiPropertyOptional({ type: VentaProductoDto })
  producto?: VentaProductoDto;
}

export class VentaResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 3980 })
  total!: number;

  @ApiProperty({ example: 0 })
  descuentoTotal!: number;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ type: [DetalleVentaResponseDto] })
  detalles!: DetalleVentaResponseDto[];
}

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  sub!: number;

  @ApiProperty({ example: 'admin@minimarket.local' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  nombre!: string;

  @ApiProperty({ example: 'ADMIN' })
  rol!: string;

  @ApiProperty({ example: ['dashboard.ver', 'stock.autorizar'] })
  permisos!: string[];
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Admin' })
  nombre!: string;

  @ApiProperty({ example: 'admin@minimarket.local' })
  email!: string;

  @ApiProperty({ example: true })
  activo!: boolean;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-09T20:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: 'ADMIN' })
  rol!: string;

  @ApiProperty({ example: ['dashboard.ver', 'stock.autorizar'] })
  permisos!: string[];
}

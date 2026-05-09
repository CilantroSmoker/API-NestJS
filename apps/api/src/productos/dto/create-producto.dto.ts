import { IsString, IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsInt()
  categoriaId!: number;

  @IsInt()
  proveedorId!: number;
}
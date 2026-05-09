import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CreateProductoDto {
  @ApiPropertyOptional({ example: '7801000000016' })
  @IsOptional()
  @IsString()
  codigoBarra?: string;

  @ApiProperty({ example: 'Coca Cola 1.5 L' })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ example: 'Bebida gaseosa familiar' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 1990, minimum: 0 })
  @IsNumber()
  @Min(0)
  precio!: number;

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoriaId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  proveedorId!: number;
}

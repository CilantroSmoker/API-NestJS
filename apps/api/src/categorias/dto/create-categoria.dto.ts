import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Bebidas', description: 'Nombre unico de la categoria' })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ example: 'Bebidas gaseosas, jugos y aguas' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100, description: 'Descuento aplicado a productos de la categoria' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuento?: number;
}

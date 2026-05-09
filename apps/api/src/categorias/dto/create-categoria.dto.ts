import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuento?: number;
}
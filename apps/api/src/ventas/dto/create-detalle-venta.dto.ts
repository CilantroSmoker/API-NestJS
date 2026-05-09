import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  productoId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}
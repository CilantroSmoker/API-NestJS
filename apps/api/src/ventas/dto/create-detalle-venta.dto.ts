import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productoId!: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad!: number;
}

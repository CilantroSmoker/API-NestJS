import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum, Min } from 'class-validator';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

export class CreateMovimientoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productoId!: number;

  @ApiProperty({ enum: TipoMovimiento, example: TipoMovimiento.ENTRADA })
  @IsEnum(TipoMovimiento)
  tipo!: TipoMovimiento;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiPropertyOptional({ example: 'Reposicion de stock' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

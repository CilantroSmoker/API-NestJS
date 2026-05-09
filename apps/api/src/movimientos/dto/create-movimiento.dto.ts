import { IsInt, IsString, IsOptional, IsEnum, Min } from 'class-validator';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

export class CreateMovimientoDto {
  @IsInt()
  productoId!: number;

  @IsEnum(TipoMovimiento)
  tipo!: TipoMovimiento;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
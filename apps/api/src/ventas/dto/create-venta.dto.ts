import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleVentaDto } from './create-detalle-venta.dto';

export class CreateVentaDto {
  @ApiProperty({
    type: [CreateDetalleVentaDto],
    example: [{ productoId: 1, cantidad: 2 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles!: CreateDetalleVentaDto[];

  @ApiProperty({
    required: false,
    enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'],
    example: 'EFECTIVO',
  })
  @IsOptional()
  @IsIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
  metodoPago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

  @ApiPropertyOptional({
    example: 'Venta autorizada con stock insuficiente',
  })
  @IsOptional()
  @IsString()
  motivoAutorizacion?: string;

  @ApiPropertyOptional({
    example: '1234',
  })
  @IsOptional()
  @IsString()
  pinAutorizacion?: string;
}

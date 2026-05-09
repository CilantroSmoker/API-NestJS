import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty({ example: 'Distribuidora Central' })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ example: '+56940001001' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto.central@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Av. Principal 1200, Santiago' })
  @IsOptional()
  @IsString()
  direccion?: string;
}

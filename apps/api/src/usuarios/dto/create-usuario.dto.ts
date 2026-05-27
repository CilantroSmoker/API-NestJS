import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ROLES, RolUsuario } from '../../auth/roles';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Vendedor Uno', minLength: 2 })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'vendedor@minimarket.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'vendedor123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '1234', minLength: 4 })
  @IsOptional()
  @IsString()
  @MinLength(4)
  pinAutorizacion?: string;

  @ApiProperty({ enum: Object.values(ROLES), example: ROLES.VENDEDOR })
  @IsIn([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN, ROLES.VENDEDOR])
  rol: RolUsuario;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

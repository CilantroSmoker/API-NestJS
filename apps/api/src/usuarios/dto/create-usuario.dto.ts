import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ROLES, RolUsuario } from '../../auth/roles';

export class CreateUsuarioDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn([ROLES.ADMIN, ROLES.SUPER_ADMIN])
  rol: RolUsuario;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

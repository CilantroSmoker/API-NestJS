import { SetMetadata } from '@nestjs/common';
import { PermisoUsuario } from './roles';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermisoUsuario[]) => SetMetadata(PERMISSIONS_KEY, permissions);

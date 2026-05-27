export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
  VENDEDOR: 'VENDEDOR',
} as const;

export type RolUsuario = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  DASHBOARD_VER: 'dashboard.ver',
  USUARIOS_GESTIONAR: 'usuarios.gestionar',
  STOCK_AUTORIZAR: 'stock.autorizar',
} as const;

export type PermisoUsuario = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type AuthUser = {
  sub: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
  permisos: PermisoUsuario[];
};

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type RolUsuario = (typeof ROLES)[keyof typeof ROLES];

export type AuthUser = {
  sub: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
};

import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { PermisoUsuario, RolUsuario } from '../auth/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  roles?: RolUsuario[];
  permissions?: PermisoUsuario[];
};

export default function ProtectedRoute({ children, roles, permissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando sesion...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.rol)) return <Navigate to="/api/productos" replace />;
  if (permissions?.length && !permissions.every((permission) => user.permisos.includes(permission))) {
    return <Navigate to="/api/productos" replace />;
  }

  return children;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { RolUsuario } from '../auth/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  roles?: RolUsuario[];
};

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando sesion...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.rol)) return <Navigate to="/api/productos" replace />;

  return children;
}

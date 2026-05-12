import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type NavbarProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

export default function Navbar({ darkMode, onToggleTheme }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>Minimarket</h1>
      {user && (
        <>
          <NavLink to="/api/categorias">Categorias</NavLink>
          <NavLink to="/api/proveedores">Proveedores</NavLink>
          <NavLink to="/api/productos">Productos</NavLink>
          <NavLink to="/api/movimientos">Movimientos</NavLink>
          <NavLink to="/api/ventas">Ventas</NavLink>
          {user.rol === 'SUPER_ADMIN' && <NavLink to="/api/usuarios">Usuarios</NavLink>}
          <span className="nav-user">{user.nombre}</span>
          <button className="nav-logout" type="button" onClick={logout}>Salir</button>
        </>
      )}
      <button
        className="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {darkMode ? '☀' : '☾'}
      </button>
    </nav>
  );
}

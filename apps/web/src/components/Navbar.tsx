import { NavLink } from 'react-router-dom';

type NavbarProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

export default function Navbar({ darkMode, onToggleTheme }: NavbarProps) {
  return (
    <nav className="navbar">
      <h1>Minimarket</h1>
      <NavLink to="/api/categorias">Categorias</NavLink>
      <NavLink to="/api/proveedores">Proveedores</NavLink>
      <NavLink to="/api/productos">Productos</NavLink>
      <NavLink to="/api/movimientos">Movimientos</NavLink>
      <NavLink to="/api/ventas">Ventas</NavLink>
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

import { NavLink } from 'react-router-dom';

type NavbarProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

export default function Navbar({ darkMode, onToggleTheme }: NavbarProps) {
  return (
    <nav className="navbar">
      <h1>Minimarket</h1>
      <NavLink to="/categorias">Categorias</NavLink>
      <NavLink to="/proveedores">Proveedores</NavLink>
      <NavLink to="/productos">Productos</NavLink>
      <NavLink to="/movimientos">Movimientos</NavLink>
      <NavLink to="/ventas">Ventas</NavLink>
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

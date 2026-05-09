import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Minimarket</h1>
      <NavLink to="/categorias">Categorías</NavLink>
      <NavLink to="/proveedores">Proveedores</NavLink>
      <NavLink to="/productos">Productos</NavLink>
      <NavLink to="/movimientos">Movimientos</NavLink>
      <NavLink to="/ventas">Ventas</NavLink>
    </nav>
  );
}
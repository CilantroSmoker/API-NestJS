import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Ventas from './pages/Ventas';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
      <Routes>
        <Route path="/" element={<Navigate to="/productos" />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

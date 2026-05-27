import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Ventas from './pages/Ventas';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import Dashboard from './pages/Dashboard';

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
    <AuthProvider>
      <BrowserRouter>
        <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/api/dashboard" replace />} />
          <Route path="/api" element={<ProtectedRoute permissions={['dashboard.ver']}><Dashboard /></ProtectedRoute>} />
          <Route path="/api/dashboard" element={<ProtectedRoute permissions={['dashboard.ver']}><Dashboard /></ProtectedRoute>} />
          <Route path="/api/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
          <Route path="/api/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
          <Route path="/api/producto" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
          <Route path="/api/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
          <Route path="/api/movimientos" element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
          <Route path="/api/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
          <Route path="/api/usuarios" element={<ProtectedRoute permissions={['usuarios.gestionar']}><Usuarios /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/api/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

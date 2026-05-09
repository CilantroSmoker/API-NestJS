import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  descuento: number;
  categoriaId: number;
  proveedorId: number;
  alertaStockBajo?: boolean;
  precioConDescuento?: number;
  categoria?: { nombre: string };
  proveedor?: { nombre: string };
}

interface Categoria { id: number; nombre: string; }
interface Proveedor { id: number; nombre: string; }

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: 0, stock: 0,
    stockMinimo: 5, descuento: 0, categoriaId: 0, proveedorId: 0,
  });

  const cargar = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busqueda) params.append('nombre', busqueda);
    if (soloStockBajo) params.append('stockBajo', 'true');
    const [prods, cats, provs] = await Promise.all([
      apiFetch<Producto[]>(`/productos?${params}`),
      apiFetch<Categoria[]>('/categorias'),
      apiFetch<Proveedor[]>('/proveedores'),
    ]);
    setProductos(prods);
    setCategorias(cats);
    setProveedores(provs);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [busqueda, soloStockBajo]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', precio: 0, stock: 0, stockMinimo: 5, descuento: 0, categoriaId: categorias[0]?.id || 0, proveedorId: proveedores[0]?.id || 0 });
    setShowModal(true);
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, stockMinimo: p.stockMinimo, descuento: p.descuento, categoriaId: p.categoriaId, proveedorId: p.proveedorId });
    setShowModal(true);
  };

  const guardar = async () => {
    try {
      setError('');
      if (editando) {
        await apiFetch(`/productos/${editando.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/productos', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      cargar();
    } catch (e: any) { setError(e.message); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await apiFetch(`/productos/${id}`, { method: 'DELETE' });
    cargar();
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Productos</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo producto</button>
      </div>

      <div className="filters">
        <input placeholder="🔍 Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input type="checkbox" checked={soloStockBajo} onChange={e => setSoloStockBajo(e.target.checked)} />
          Solo stock bajo ⚠️
        </label>
      </div>

      <div className="cards-grid">
        {productos.map(p => (
          <div className="card" key={p.id} style={{ borderLeftColor: p.alertaStockBajo ? '#ff4d4d' : '#e94560' }}>
            <h3>{p.nombre}</h3>
            <p>{p.categoria?.nombre} · {p.proveedor?.nombre}</p>
            <p>Precio: <strong>${p.precio.toLocaleString()}</strong>
              {p.descuento > 0 && <span className="badge badge-yellow" style={{ marginLeft: '0.5rem' }}>-{p.descuento}%</span>}
            </p>
            <p>Stock: <strong>{p.stock}</strong> / Mínimo: {p.stockMinimo}
              {p.alertaStockBajo && <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>⚠️ Bajo</span>}
            </p>
            {p.precioConDescuento !== undefined && p.precioConDescuento !== p.precio && (
              <p>Precio final: <strong style={{ color: '#e94560' }}>${p.precioConDescuento.toLocaleString()}</strong></p>
            )}
            <div className="card-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar producto' : 'Nuevo producto'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
          <div className="form-group"><label>Descripción</label>
            <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
          <div className="form-group"><label>Precio</label>
            <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: +e.target.value })} /></div>
          <div className="form-group"><label>Stock inicial</label>
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} /></div>
          <div className="form-group"><label>Stock mínimo</label>
            <input type="number" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: +e.target.value })} /></div>
          <div className="form-group"><label>Descuento (%)</label>
            <input type="number" value={form.descuento} onChange={e => setForm({ ...form, descuento: +e.target.value })} /></div>
          <div className="form-group"><label>Categoría</label>
            <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: +e.target.value })}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select></div>
          <div className="form-group"><label>Proveedor</label>
            <select value={form.proveedorId} onChange={e => setForm({ ...form, proveedorId: +e.target.value })}>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select></div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
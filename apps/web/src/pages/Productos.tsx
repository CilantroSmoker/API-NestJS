import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

interface Producto {
  id: number;
  codigoBarra?: string | null;
  nombre: string;
  descripcion?: string | null;
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

interface ProductosResponse {
  items: Producto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const PRODUCTOS_POR_PAGINA = 48;

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [meta, setMeta] = useState<ProductosResponse['meta']>({
    page: 1,
    limit: PRODUCTOS_POR_PAGINA,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [stockMax, setStockMax] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codigoBarra: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    stockMinimo: 5,
    descuento: 0,
    categoriaId: 0,
    proveedorId: 0,
  });

  const cargar = async () => {
    setFetching(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(PRODUCTOS_POR_PAGINA));
    if (busquedaAplicada) params.append('q', busquedaAplicada);
    if (categoriaFiltro) params.append('categoriaId', categoriaFiltro);
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);
    if (stockMin) params.append('stockMin', stockMin);
    if (stockMax) params.append('stockMax', stockMax);
    if (soloStockBajo) params.append('stockBajo', 'true');

    try {
      setError('');
      const response = await apiFetch<ProductosResponse>(`/productos?${params}`);
      setProductos(response.items);
      setMeta(response.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const cargarRelaciones = async () => {
    try {
      const [cats, provs] = await Promise.all([
        apiFetch<Categoria[]>('/categorias'),
        apiFetch<Proveedor[]>('/proveedores'),
      ]);
      setCategorias(cats);
      setProveedores(provs);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { cargarRelaciones(); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBusquedaAplicada(busqueda.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
      return;
    }
    cargar();
  }, [busquedaAplicada, categoriaFiltro, precioMin, precioMax, stockMin, stockMax, soloStockBajo]);

  useEffect(() => {
    if (page !== 1) cargar();
  }, [page]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({
      codigoBarra: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      stockMinimo: 5,
      descuento: 0,
      categoriaId: categorias[0]?.id || 0,
      proveedorId: proveedores[0]?.id || 0,
    });
    setShowModal(true);
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({
      codigoBarra: p.codigoBarra || '',
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      descuento: p.descuento,
      categoriaId: p.categoriaId,
      proveedorId: p.proveedorId,
    });
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
    } catch (e: any) {
      setError(e.message);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar este producto?')) return;
    try {
      setError('');
      await apiFetch(`/productos/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Productos</h2>
          <p className="page-subtitle">
            Mostrando {productos.length} de {meta.total.toLocaleString('es-CL')} productos
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo producto</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="filters">
        <input placeholder="Buscar por nombre, ID o codigo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas las categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input type="number" placeholder="Precio min" value={precioMin} onChange={e => setPrecioMin(e.target.value)} />
        <input type="number" placeholder="Precio max" value={precioMax} onChange={e => setPrecioMax(e.target.value)} />
        <input type="number" placeholder="Stock min" value={stockMin} onChange={e => setStockMin(e.target.value)} />
        <input type="number" placeholder="Stock max" value={stockMax} onChange={e => setStockMax(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input type="checkbox" checked={soloStockBajo} onChange={e => setSoloStockBajo(e.target.checked)} />
          Solo stock bajo
        </label>
      </div>

      {fetching && <div className="loading loading-inline">Actualizando...</div>}

      <div className="cards-grid">
        {productos.map(p => (
          <div className="card" key={p.id} style={{ borderLeftColor: p.alertaStockBajo ? '#ff4d4d' : '#e94560' }}>
            <h3>{p.nombre}</h3>
            {p.codigoBarra && <p>Codigo: <strong>{p.codigoBarra}</strong></p>}
            <p>{p.categoria?.nombre} - {p.proveedor?.nombre}</p>
            <p>Precio: <strong>${p.precio.toLocaleString()}</strong>
              {p.descuento > 0 && <span className="badge badge-yellow" style={{ marginLeft: '0.5rem' }}>-{p.descuento}%</span>}
            </p>
            <p>Stock: <strong>{p.stock}</strong> / Minimo: {p.stockMinimo}
              {p.alertaStockBajo && <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>Bajo</span>}
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

      <div className="pagination">
        <button
          className="btn btn-secondary"
          disabled={!meta.hasPreviousPage || fetching}
          onClick={() => setPage(value => Math.max(value - 1, 1))}
        >
          Anterior
        </button>
        <span>Pagina {meta.page} de {meta.totalPages}</span>
        <button
          className="btn btn-secondary"
          disabled={!meta.hasNextPage || fetching}
          onClick={() => setPage(value => value + 1)}
        >
          Siguiente
        </button>
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar producto' : 'Nuevo producto'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Codigo de barra</label>
            <input value={form.codigoBarra} onChange={e => setForm({ ...form, codigoBarra: e.target.value })} /></div>
          <div className="form-group"><label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
          <div className="form-group"><label>Descripcion</label>
            <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
          <div className="form-group"><label>Precio</label>
            <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: +e.target.value })} /></div>
          <div className="form-group"><label>Stock inicial</label>
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} /></div>
          <div className="form-group"><label>Stock minimo</label>
            <input type="number" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: +e.target.value })} /></div>
          <div className="form-group"><label>Descuento (%)</label>
            <input type="number" value={form.descuento} onChange={e => setForm({ ...form, descuento: +e.target.value })} /></div>
          <div className="form-group"><label>Categoria</label>
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

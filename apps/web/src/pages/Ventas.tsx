import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

interface Venta {
  id: number;
  total: number;
  descuentoTotal: number;
  createdAt: string;
  detalles?: { productoId: number; cantidad: number; subtotal: number; producto?: { nombre: string } }[];
}

interface Producto {
  id: number;
  codigoBarra?: string | null;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductosResponse {
  items: Producto[];
}

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detalles, setDetalles] = useState([{ productoId: 0, cantidad: 1 }]);
  const [error, setError] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [buscandoProductos, setBuscandoProductos] = useState(false);

  const cargarProductos = async (busqueda = '', resetDetalle = false) => {
    const params = new URLSearchParams({ limit: '100' });
    const q = busqueda.trim();
    if (q) params.set('q', q);

    setBuscandoProductos(true);
    try {
      const response = await apiFetch<ProductosResponse>(`/productos?${params}`);
      setProductos(response.items);
      if (resetDetalle && response.items.length > 0) {
        setDetalles([{ productoId: response.items[0].id, cantidad: 1 }]);
      }
    } finally {
      setBuscandoProductos(false);
    }
  };

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [vs, ps] = await Promise.all([
        apiFetch<Venta[]>('/ventas'),
        apiFetch<ProductosResponse>('/productos?limit=100'),
      ]);
      setVentas(vs);
      setProductos(ps.items);
      if (ps.items.length > 0) setDetalles([{ productoId: ps.items[0].id, cantidad: 1 }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (!showModal) return;
    const timer = window.setTimeout(() => {
      cargarProductos(busquedaProducto).catch((e: any) => setError(e.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [busquedaProducto, showModal]);

  const abrirNuevaVenta = () => {
    setError('');
    setBusquedaProducto('');
    setShowModal(true);
    cargarProductos('', productos.length === 0).catch((e: any) => setError(e.message));
  };

  const agregarDetalle = () => setDetalles([...detalles, { productoId: productos[0]?.id || 0, cantidad: 1 }]);
  const quitarDetalle = (i: number) => setDetalles(detalles.filter((_, idx) => idx !== i));

  const guardar = async () => {
    try {
      setError('');
      await apiFetch('/ventas', { method: 'POST', body: JSON.stringify({ detalles }) });
      setShowModal(false);
      cargar();
    } catch (e: any) { setError(e.message); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar esta venta? Se restaurara el stock de sus productos.')) return;
    try {
      setError('');
      await apiFetch(`/ventas/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Ventas</h2>
        <button className="btn btn-primary" onClick={abrirNuevaVenta}>+ Nueva venta</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Total</th>
              <th>Descuento</th>
              <th>Productos</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>#{v.id}</td>
                <td><strong>${v.total.toLocaleString()}</strong></td>
                <td>{v.descuentoTotal > 0 ? `$${v.descuentoTotal.toLocaleString()}` : '-'}</td>
                <td>{v.detalles?.map(d => `${d.producto?.nombre} x${d.cantidad}`).join(', ')}</td>
                <td>{new Date(v.createdAt).toLocaleString('es-CL')}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Nueva venta" onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Buscar producto</label>
            <input
              value={busquedaProducto}
              onChange={e => setBusquedaProducto(e.target.value)}
              placeholder="Nombre, codigo de barra o ID"
            />
          </div>
          {buscandoProductos && <div className="loading loading-inline">Buscando productos...</div>}
          {detalles.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                {i === 0 && <label>Producto</label>}
                <select value={d.productoId} onChange={e => {
                  const copy = [...detalles];
                  copy[i].productoId = +e.target.value;
                  setDetalles(copy);
                }}>
                  {productos.length === 0 && <option value={0}>Sin productos encontrados</option>}
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.codigoBarra ? `- ${p.codigoBarra}` : ''} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                {i === 0 && <label>Cantidad</label>}
                <input type="number" min={1} value={d.cantidad} onChange={e => {
                  const copy = [...detalles];
                  copy[i].cantidad = +e.target.value;
                  setDetalles(copy);
                }} />
              </div>
              {detalles.length > 1 && (
                <button className="btn btn-danger btn-sm" onClick={() => quitarDetalle(i)}>✕</button>
              )}
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={agregarDetalle} style={{ marginBottom: '1rem' }}>
            + Agregar producto
          </button>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar}>Confirmar venta</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

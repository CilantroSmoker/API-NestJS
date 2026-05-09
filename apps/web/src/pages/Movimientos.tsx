import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: number;
  motivo?: string;
  stockAntes: number;
  stockDespues: number;
  createdAt: string;
  producto?: { nombre: string };
}

interface Producto { id: number; nombre: string; }

interface ProductosResponse {
  items: Producto[];
}

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ productoId: 0, tipo: 'ENTRADA', cantidad: 1, motivo: '' });
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [movs, prods] = await Promise.all([
        apiFetch<Movimiento[]>('/movimientos'),
        apiFetch<ProductosResponse>('/productos?limit=100'),
      ]);
      setMovimientos(movs);
      setProductos(prods.items);
      if (prods.items.length > 0) setForm(f => ({ ...f, productoId: prods.items[0].id }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    try {
      setError('');
      await apiFetch('/movimientos', { method: 'POST', body: JSON.stringify(form) });
      setShowModal(false);
      cargar();
    } catch (e: any) { setError(e.message); }
  };

  const tipoBadge = (tipo: string) => {
    if (tipo === 'ENTRADA') return <span className="badge badge-green">ENTRADA</span>;
    if (tipo === 'SALIDA') return <span className="badge badge-red">SALIDA</span>;
    return <span className="badge badge-yellow">AJUSTE</span>;
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Movimientos de Stock</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo movimiento</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock antes</th>
              <th>Stock después</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(m => (
              <tr key={m.id}>
                <td>{m.producto?.nombre}</td>
                <td>{tipoBadge(m.tipo)}</td>
                <td>{m.cantidad}</td>
                <td>{m.stockAntes}</td>
                <td>{m.stockDespues}</td>
                <td>{m.motivo || '-'}</td>
                <td>{new Date(m.createdAt).toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Nuevo movimiento" onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Producto</label>
            <select value={form.productoId} onChange={e => setForm({ ...form, productoId: +e.target.value })}>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select></div>
          <div className="form-group"><label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="AJUSTE">AJUSTE</option>
            </select></div>
          <div className="form-group"><label>Cantidad</label>
            <input type="number" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: +e.target.value })} /></div>
          <div className="form-group"><label>Motivo</label>
            <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} /></div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

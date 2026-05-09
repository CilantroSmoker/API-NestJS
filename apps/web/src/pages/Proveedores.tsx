import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  _count?: { productos: number };
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' });
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch<Proveedor[]>('/proveedores');
      setProveedores(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', telefono: '', email: '', direccion: '' });
    setShowModal(true);
  };

  const abrirEditar = (proveedor: Proveedor) => {
    setEditando(proveedor);
    setForm({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
    });
    setShowModal(true);
  };

  const guardar = async () => {
    try {
      setError('');
      const body = JSON.stringify({
        nombre: form.nombre,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
        direccion: form.direccion || undefined,
      });

      if (editando) {
        await apiFetch(`/proveedores/${editando.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch('/proveedores', { method: 'POST', body });
      }
      setShowModal(false);
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar este proveedor?')) return;
    try {
      setError('');
      await apiFetch(`/proveedores/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Proveedores</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo proveedor</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="cards-grid">
        {proveedores.map(proveedor => (
          <div className="card" key={proveedor.id}>
            <h3>{proveedor.nombre}</h3>
            <p>Telefono: <strong>{proveedor.telefono || '-'}</strong></p>
            <p>Email: <strong>{proveedor.email || '-'}</strong></p>
            <p>Direccion: <strong>{proveedor.direccion || '-'}</strong></p>
            <p>Productos: <strong>{proveedor._count?.productos ?? 0}</strong></p>
            <div className="card-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(proveedor)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(proveedor.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar proveedor' : 'Nuevo proveedor'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Telefono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Direccion</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

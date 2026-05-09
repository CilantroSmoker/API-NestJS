import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  descuento: number;
  _count?: { productos: number };
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', descuento: 0 });
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch<Categoria[]>('/categorias');
      setCategorias(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', descuento: 0 });
    setShowModal(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '', descuento: cat.descuento });
    setShowModal(true);
  };

  const guardar = async () => {
    try {
      setError('');
      if (editando) {
        await apiFetch(`/categorias/${editando.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/categorias', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar esta categoria?')) return;
    try {
      setError('');
      await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Categorías</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nueva categoría</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="cards-grid">
        {categorias.map(cat => (
          <div className="card" key={cat.id}>
            <h3>{cat.nombre}</h3>
            <p>{cat.descripcion || 'Sin descripción'}</p>
            <p>Descuento: <strong>{cat.descuento}%</strong></p>
            <p>Productos: <strong>{cat._count?.productos ?? 0}</strong></p>
            <div className="card-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(cat)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(cat.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Descuento (%)</label>
            <input type="number" value={form.descuento} onChange={e => setForm({ ...form, descuento: +e.target.value })} />
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

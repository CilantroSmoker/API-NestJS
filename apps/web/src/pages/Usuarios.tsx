import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import type { RolUsuario } from '../auth/AuthContext';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
};

const emptyForm = {
  nombre: '',
  email: '',
  password: '',
  pinAutorizacion: '',
  rol: 'ADMIN' as RolUsuario,
  activo: true,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = async () => {
    try {
      setError('');
      setUsuarios(await apiFetch<Usuario[]>('/usuarios'));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      pinAutorizacion: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setShowModal(true);
  };

  const guardar = async () => {
    const payload: Record<string, unknown> = {
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
      activo: form.activo,
    };
    if (form.password) payload.password = form.password;
    if (form.pinAutorizacion) payload.pinAutorizacion = form.pinAutorizacion;

    try {
      setError('');
      if (editando) {
        await apiFetch(`/usuarios/${editando.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify({ ...payload, password: form.password }) });
      }
      setShowModal(false);
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar este usuario?')) return;
    try {
      setError('');
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p className="page-subtitle">Control de cuentas administrativas</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo usuario</button>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol === 'SUPER_ADMIN' ? 'Super admin' : usuario.rol === 'SUPERVISOR' ? 'Supervisor' : usuario.rol === 'VENDEDOR' ? 'Vendedor' : 'Admin'}</td>
                <td>
                  <span className={`badge ${usuario.activo ? 'badge-green' : 'badge-red'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(usuario)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => eliminar(usuario.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div className="form-group"><label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Contrasena</label>
            <input
              type="password"
              value={form.password}
              placeholder={editando ? 'Dejar vacia para mantenerla' : ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            /></div>
          <div className="form-group"><label>PIN autorizacion</label>
            <input
              type="password"
              inputMode="numeric"
              value={form.pinAutorizacion}
              placeholder={editando ? 'Dejar vacio para mantenerlo' : 'Opcional'}
              onChange={(e) => setForm({ ...form, pinAutorizacion: e.target.value })}
            /></div>
          <div className="form-group"><label>Rol</label>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}>
              <option value="ADMIN">Admin</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="SUPER_ADMIN">Super admin</option>
              <option value="VENDEDOR">Vendedor</option>
            </select></div>
          <div className="form-group checkbox-field">
            <label>
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              Usuario activo
            </label>
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

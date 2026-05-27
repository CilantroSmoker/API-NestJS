import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (user) return <Navigate to="/api/productos" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={handleSubmit}>
        <div>
          <h1>Minimarket</h1>
          <p>Ingreso de administradores</p>
        </div>

        {error && <Alert message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="form-group">
          <label>Contrasena</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={sending}>
          {sending ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}

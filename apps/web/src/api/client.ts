const BASE_URL = 'http://localhost:3000/api';

export const TOKEN_KEY = 'minimarket_token';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    if (res.status === 401) localStorage.removeItem(TOKEN_KEY);
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || 'Error en la peticion');
  }
  return res.json();
}

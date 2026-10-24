const API_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_PROTOCOL = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const API_URL = (import.meta.env.VITE_API_URL || `${API_PROTOCOL}//${API_HOST}:4000/api`).replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('internpath_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
    });
  } catch {
    throw new Error('Could not reach the API. Make sure the backend is running on port 4000.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new CustomEvent('internpath:unauthorized'));
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

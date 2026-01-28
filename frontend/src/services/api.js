const API_URL = 'http://localhost:3001';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const url = `${API_URL}${endpoint}${
    endpoint.includes('?') ? '&' : '?'
  }_t=${Date.now()}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'API error');
  }

  if (res.status === 204 || res.status === 304) {
    return null;
  }

  return res.json();
};

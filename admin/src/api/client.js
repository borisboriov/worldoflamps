function getToken() {
  try {
    return localStorage.getItem('admin_token') || '';
  } catch {
    return '';
  }
}

export async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(8000),
  });

  if (res.status === 401) {
    // Token invalid/expired — kick out
    try { localStorage.removeItem('admin_token'); } catch { /* ignore */ }
    window.dispatchEvent(new Event('admin:unauthorized'));
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch { /* ignore */ }
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

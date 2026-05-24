import { apiFetch } from './client';

export function login(username, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function me() {
  return apiFetch('/api/auth/me');
}

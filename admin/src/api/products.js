import { apiFetch } from './client';

export function listCategories() {
  return apiFetch('/api/products/categories');
}

export function listProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);
  if (params.per_page) qs.set('per_page', params.per_page);
  if (params.sort) qs.set('sort', params.sort);
  return apiFetch(`/api/products/products?${qs}`);
}

export function getProduct(id) {
  return apiFetch(`/api/products/products/${id}`);
}

export function createProduct(payload) {
  return apiFetch('/api/products/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return apiFetch(`/api/products/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return apiFetch(`/api/products/products/${id}`, { method: 'DELETE' });
}

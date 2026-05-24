import { apiFetch } from './client';

export function listOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', params.page);
  if (params.per_page) qs.set('per_page', params.per_page);
  return apiFetch(`/api/orders?${qs}`);
}

export function getOrder(idOrNumber) {
  return apiFetch(`/api/orders/${idOrNumber}`);
}

export function updateOrderStatus(id, status) {
  return apiFetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

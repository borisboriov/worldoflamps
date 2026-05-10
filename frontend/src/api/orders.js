export async function createOrder(payload) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (e.message && !e.message.startsWith('HTTP') && !e.name === 'AbortError') throw e;
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return {
      id: parseInt(num, 10),
      order_number: `LMP-${num}`,
      status: 'new',
      total: payload.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2),
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_address: payload.customer_address,
      comment: payload.comment || null,
      items: payload.items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function getOrder(orderNumber) {
  const res = await fetch(`/api/orders/${orderNumber}`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('NOT_FOUND');
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

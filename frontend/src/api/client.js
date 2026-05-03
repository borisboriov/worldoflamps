export async function fetchWithFallback(url, mockFn) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch {
    return mockFn();
  }
}

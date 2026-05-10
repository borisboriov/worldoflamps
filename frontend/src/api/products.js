import { fetchWithFallback } from './client';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';

export function getCategories() {
  return fetchWithFallback('/api/products/categories', () => mockCategories);
}

export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.min_price) qs.set('min_price', params.min_price);
  if (params.max_price) qs.set('max_price', params.max_price);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', params.page);
  if (params.per_page) qs.set('per_page', params.per_page);

  return fetchWithFallback(`/api/products/products?${qs}`, () =>
    mockGetProducts(params)
  );
}

export function getProduct(slug) {
  return fetchWithFallback(`/api/products/products/${slug}`, () => {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) throw new Error('Not found');
    return product;
  });
}

function mockGetProducts(params) {
  const { category, min_price, max_price, search, sort = 'name', page = 1, per_page = 12 } = params;

  let items = mockProducts.filter((p) => {
    if (category && p.category.slug !== category) return false;
    if (min_price && parseFloat(p.price) < parseFloat(min_price)) return false;
    if (max_price && parseFloat(p.price) > parseFloat(max_price)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sort === 'price') items = [...items].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  else if (sort === '-price') items = [...items].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  else items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const total = items.length;
  const pageNum = parseInt(page, 10);
  const perPageNum = parseInt(per_page, 10);
  const pages = Math.max(1, Math.ceil(total / perPageNum));
  const start = (pageNum - 1) * perPageNum;
  items = items.slice(start, start + perPageNum);

  return { items, total, page: pageNum, per_page: perPageNum, pages };
}

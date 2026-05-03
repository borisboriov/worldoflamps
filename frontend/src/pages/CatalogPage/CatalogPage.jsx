import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../api/products';
import ProductCard from '../../components/ProductCard/ProductCard';
import Filters from '../../components/Filters/Filters';
import Pagination from '../../components/Pagination/Pagination';
import s from './CatalogPage.module.css';

export default function CatalogPage() {
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = {
      category: params.get('category') || undefined,
      min_price: params.get('min_price') || undefined,
      max_price: params.get('max_price') || undefined,
      search: params.get('search') || undefined,
      sort: params.get('sort') || undefined,
      page: params.get('page') || 1,
      per_page: 12,
    };
    getProducts(p).then((d) => { setData(d); setLoading(false); });
  }, [params.toString()]);

  const page = parseInt(params.get('page') || '1', 10);

  return (
    <div className={s.page}>
      <h1 className={s.title}>Каталог ламп</h1>
      <Filters categories={categories} />

      {!loading && data && (
        <p className={s.meta}>Найдено товаров: {data.total}</p>
      )}

      <div className={s.grid}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <div key={i} className={s.skeleton} />)
          : data?.items.length === 0
          ? null
          : data?.items.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {!loading && data?.items.length === 0 && (
        <p className={s.empty}>Товары не найдены. Попробуйте изменить фильтры.</p>
      )}

      {!loading && data && (
        <Pagination page={page} pages={data.pages} />
      )}
    </div>
  );
}

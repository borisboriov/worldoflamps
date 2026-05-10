import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../../store/slices/productsSlice';
import ProductCard from '../../components/ProductCard/ProductCard';
import Filters from '../../components/Filters/Filters';
import Pagination from '../../components/Pagination/Pagination';
import s from './CatalogPage.module.css';

export default function CatalogPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.products.list);
  const status = useSelector((state) => state.products.listStatus);
  const categories = useSelector((state) => state.products.categories);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  useEffect(() => {
    const p = {
      category: params.get('category') || undefined,
      min_price: params.get('min_price') || undefined,
      max_price: params.get('max_price') || undefined,
      search: params.get('search') || undefined,
      sort: params.get('sort') || undefined,
      page: params.get('page') || 1,
      per_page: 12,
    };
    dispatch(fetchProducts(p));
  }, [dispatch, params]);

  const page = parseInt(params.get('page') || '1', 10);
  const loading = status === 'loading';

  return (
    <div className={s.page}>
      <h1 className={s.title}>Каталог ламп</h1>
      <Filters categories={categories} />

      {!loading && (
        <p className={s.meta}>Найдено товаров: {data.total}</p>
      )}

      <div className={s.grid}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <div key={i} className={s.skeleton} />)
          : data.items.length === 0
          ? null
          : data.items.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {!loading && data.items.length === 0 && (
        <p className={s.empty}>Товары не найдены. Попробуйте изменить фильтры.</p>
      )}

      {!loading && (
        <Pagination page={page} pages={data.pages} />
      )}
    </div>
  );
}

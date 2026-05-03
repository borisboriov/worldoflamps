import { useSearchParams } from 'react-router-dom';
import s from './Filters.module.css';

export default function Filters({ categories }) {
  const [params, setParams] = useSearchParams();

  function set(key, value) {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setParams(next);
  }

  function reset() {
    setParams({});
  }

  const hasFilters = params.get('category') || params.get('search') ||
    params.get('min_price') || params.get('max_price');

  return (
    <div className={s.filters}>
      <div className={s.group}>
        <span className={s.label}>Категория</span>
        <div className={s.categories}>
          <button
            className={`${s.catBtn} ${!params.get('category') ? s.catBtnActive : ''}`}
            onClick={() => set('category', '')}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              className={`${s.catBtn} ${params.get('category') === c.slug ? s.catBtnActive : ''}`}
              onClick={() => set('category', c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className={s.group}>
        <span className={s.label}>Поиск</span>
        <input
          className={s.input}
          placeholder="Название товара…"
          value={params.get('search') || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      <div className={s.group}>
        <span className={s.label}>Цена, ₽</span>
        <div className={s.priceRow}>
          <input
            className={`${s.input} ${s.priceInput}`}
            type="number"
            min="0"
            placeholder="от"
            value={params.get('min_price') || ''}
            onChange={(e) => set('min_price', e.target.value)}
          />
          <span>—</span>
          <input
            className={`${s.input} ${s.priceInput}`}
            type="number"
            min="0"
            placeholder="до"
            value={params.get('max_price') || ''}
            onChange={(e) => set('max_price', e.target.value)}
          />
        </div>
      </div>

      <div className={s.group}>
        <span className={s.label}>Сортировка</span>
        <select
          className={s.select}
          value={params.get('sort') || 'name'}
          onChange={(e) => set('sort', e.target.value)}
        >
          <option value="name">По названию</option>
          <option value="price">Цена: по возрастанию</option>
          <option value="-price">Цена: по убыванию</option>
        </select>
      </div>

      {hasFilters && (
        <button className={s.resetBtn} onClick={reset}>Сбросить фильтры</button>
      )}
    </div>
  );
}

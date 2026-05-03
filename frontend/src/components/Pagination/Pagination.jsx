import { useSearchParams } from 'react-router-dom';
import s from './Pagination.module.css';

export default function Pagination({ page, pages }) {
  const [params, setParams] = useSearchParams();

  function goTo(p) {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (pages <= 1) return null;

  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className={s.pagination}>
      <button className={s.btn} disabled={page <= 1} onClick={() => goTo(page - 1)}>←</button>
      {nums.map((n) => (
        <button
          key={n}
          className={`${s.btn} ${n === page ? s.active : ''}`}
          onClick={() => goTo(n)}
        >
          {n}
        </button>
      ))}
      <button className={s.btn} disabled={page >= pages} onClick={() => goTo(page + 1)}>→</button>
    </div>
  );
}

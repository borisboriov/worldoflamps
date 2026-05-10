import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, selectCartItems, selectCartTotals } from '../../store/slices/cartSlice';
import s from './CartPage.module.css';

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const { totalPrice } = useSelector(selectCartTotals);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className={s.page}>
        <h1 className={s.title}>Корзина</h1>
        <div className={s.empty}>
          <span className={s.emptyIcon}>🛒</span>
          <p className={s.emptyText}>Ваша корзина пуста</p>
          <Link to="/catalog" className={s.catalogLink}>Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Корзина</h1>
      <div className={s.list}>
        {items.map((item) => (
          <div key={item.id} className={s.row}>
            <div className={s.thumb}>💡</div>
            <div className={s.info}>
              <Link to={`/products/${item.slug}`} className={s.name}>{item.name}</Link>
              <div className={s.qty}>
                {parseFloat(item.price).toLocaleString('ru-RU')} ₽ × {item.quantity}
              </div>
            </div>
            <span className={s.lineTotal}>
              {(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
            </span>
            <button className={s.removeBtn} title="Удалить" onClick={() => dispatch(removeItem(item.id))}>×</button>
          </div>
        ))}
      </div>
      <div className={s.footer}>
        <span className={s.total}>
          Итого: <span className={s.totalVal}>{parseFloat(totalPrice).toLocaleString('ru-RU')} ₽</span>
        </span>
        <button className={s.checkoutBtn} onClick={() => navigate('/checkout')}>Оформить заказ</button>
      </div>
    </div>
  );
}

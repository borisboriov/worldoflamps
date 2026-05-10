import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearLast } from '../../store/slices/ordersSlice';
import s from './ConfirmationPage.module.css';

export default function ConfirmationPage() {
  const last = useSelector((state) => state.orders.last);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => { dispatch(clearLast()); };
  }, [dispatch]);

  const orderNum = last?.order?.order_number;
  const orderItems = last?.snapshot?.orderItems || [];
  const total = last?.snapshot?.total;

  return (
    <div className={s.page}>
      <div className={s.circle}>OK</div>
      <h1 className={s.title}>Заказ оформлен!</h1>
      {orderNum && (
        <>
          <span className={s.orderNumLabel}>Номер заказа:</span>
          <span className={s.orderNum}>{orderNum}</span>
        </>
      )}

      {orderItems.length > 0 && (
        <div className={s.composition}>
          <div className={s.compTitle}>Состав заказа:</div>
          {orderItems.map((item, i) => (
            <div key={i} className={s.compRow}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
          {total && (
            <div className={s.compTotal}>
              <span>Итого:</span>
              <span>{parseFloat(total).toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
        </div>
      )}

      <div className={s.actions}>
        <Link to="/" className={s.btn}>На главную</Link>
        <Link to="/orders" className={s.btnSecondary}>Мои заказы</Link>
      </div>
    </div>
  );
}

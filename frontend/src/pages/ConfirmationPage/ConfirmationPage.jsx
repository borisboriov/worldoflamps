import { Link, useSearchParams, useLocation } from 'react-router-dom';
import s from './ConfirmationPage.module.css';

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const { state } = useLocation();

  const orderNum = state?.order?.order_number || params.get('order');
  const orderItems = state?.orderItems || [];
  const total = state?.total;

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

      <Link to="/" className={s.btn}>На главную</Link>
    </div>
  );
}

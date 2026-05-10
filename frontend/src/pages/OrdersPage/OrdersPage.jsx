import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/ordersSlice';
import s from './OrdersPage.module.css';

const STATUS_LABEL = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function StatusBadge({ status }) {
  const cls = s[`status_${status}`] || s.status_new;
  return <span className={`${s.badge} ${cls}`}>{STATUS_LABEL[status] || status}</span>;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const dispatch = useDispatch();
  const numbers = useSelector((state) => state.orders.myOrderNumbers);
  const orders = useSelector((state) => state.orders.myOrders);
  const status = useSelector((state) => state.orders.myOrdersStatus);

  useEffect(() => {
    if (numbers.length > 0) dispatch(fetchMyOrders());
  }, [dispatch, numbers.length]);

  if (numbers.length === 0) {
    return (
      <div className={s.page}>
        <h1 className={s.title}>Мои заказы</h1>
        <div className={s.empty}>
          <p className={s.emptyText}>У вас пока нет заказов.</p>
          <Link to="/catalog" className={s.catalogLink}>Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Мои заказы</h1>

      {status === 'loading' && (
        <p className={s.loading}>Загружаем заказы…</p>
      )}

      <div className={s.list}>
        {orders.map((order) => {
          if (order._missing) {
            return (
              <div key={order.order_number} className={s.card}>
                <div className={s.head}>
                  <span className={s.orderNum}>{order.order_number}</span>
                  <span className={s.unavailable}>Недоступен</span>
                </div>
                <p className={s.unavailableText}>Не удалось загрузить заказ.</p>
              </div>
            );
          }

          const items = order.items || order.items_snapshot || [];
          return (
            <div key={order.order_number} className={s.card}>
              <div className={s.head}>
                <span className={s.orderNum}>{order.order_number}</span>
                <StatusBadge status={order.status || 'new'} />
              </div>
              <div className={s.meta}>
                <span>{formatDate(order.created_at)}</span>
                {order._offline && <span className={s.offlineTag}>офлайн-копия</span>}
              </div>
              {items.length > 0 && (
                <div className={s.items}>
                  {items.map((it, i) => (
                    <div key={i} className={s.itemRow}>
                      <span>{it.product_name || it.name} × {it.quantity}</span>
                      <span>{(parseFloat(it.price) * it.quantity).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                </div>
              )}
              {order.total != null && (
                <div className={s.total}>
                  <span>Итого:</span>
                  <span>{parseFloat(order.total).toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

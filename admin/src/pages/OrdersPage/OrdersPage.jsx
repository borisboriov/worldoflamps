import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrders, fetchOrderDetail,
  changeStatusThunk, clearDetail, clearError,
} from '../../store/slices/ordersSlice';
import Modal from '../../components/Modal/Modal';
import s from './OrdersPage.module.css';

const STATUS_LABEL = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const TRANSITIONS = {
  new: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
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
  const { items, detail, detailStatus, status, error } = useSelector((state) => state.adminOrders);
  const [filter, setFilter] = useState('');
  const [openOrder, setOpenOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders(filter ? { status: filter } : {}));
  }, [dispatch, filter]);

  useEffect(() => {
    if (openOrder) dispatch(fetchOrderDetail(openOrder.id));
    else dispatch(clearDetail());
  }, [dispatch, openOrder]);

  async function changeStatus(newStatus) {
    await dispatch(changeStatusThunk({ id: openOrder.id, status: newStatus }));
    dispatch(fetchOrderDetail(openOrder.id));
  }

  const loading = status === 'loading';

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Заказы</h1>
      </div>

      <div className={s.toolbar}>
        <span className={s.toolLabel}>Фильтр:</span>
        <select
          className={s.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Все</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className={s.meta}>Всего: {items.length}</span>
      </div>

      {error && (
        <div className={s.errorBanner}>
          {error}
          <button onClick={() => dispatch(clearError())} className={s.errorClose}>×</button>
        </div>
      )}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan="6" className={s.empty}>Загрузка…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan="6" className={s.empty}>Заказов не найдено</td></tr>
            )}
            {items.map((o) => (
              <tr key={o.id} className={s.row} onClick={() => setOpenOrder(o)}>
                <td className={s.mono}>{o.order_number}</td>
                <td>{o.customer_name}</td>
                <td className={s.mono}>{formatDate(o.created_at)}</td>
                <td className={s.mono}>{parseFloat(o.total).toLocaleString('ru-RU')} ₽</td>
                <td><StatusBadge status={o.status} /></td>
                <td className={s.openBtn}>Открыть →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openOrder && (
        <Modal
          title={`Заказ ${openOrder.order_number}`}
          onClose={() => setOpenOrder(null)}
        >
          {detailStatus === 'loading' && <p>Загрузка деталей…</p>}
          {detail && (
            <>
              <div className={s.detailHead}>
                <StatusBadge status={detail.status} />
                <span className={s.detailDate}>{formatDate(detail.created_at)}</span>
              </div>

              <dl className={s.dl}>
                <dt>Клиент</dt><dd>{detail.customer_name}</dd>
                <dt>Телефон</dt><dd>{detail.customer_phone}</dd>
                <dt>Адрес</dt><dd>{detail.customer_address}</dd>
                {detail.comment && <><dt>Комментарий</dt><dd>{detail.comment}</dd></>}
              </dl>

              <h3 className={s.section}>Состав</h3>
              <div className={s.items}>
                {(detail.items || []).map((it, i) => (
                  <div key={i} className={s.itemRow}>
                    <span>{it.product_name} × {it.quantity}</span>
                    <span className={s.mono}>{(parseFloat(it.price) * it.quantity).toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
                <div className={s.totalRow}>
                  <span>Итого:</span>
                  <span className={s.mono}>{parseFloat(detail.total).toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {TRANSITIONS[detail.status]?.length > 0 && (
                <>
                  <h3 className={s.section}>Сменить статус</h3>
                  <div className={s.transitions}>
                    {TRANSITIONS[detail.status].map((next) => (
                      <button
                        key={next}
                        className={`${s.transBtn} ${s[`transBtn_${next}`]}`}
                        onClick={() => changeStatus(next)}
                      >
                        → {STATUS_LABEL[next]}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {TRANSITIONS[detail.status]?.length === 0 && (
                <p className={s.finalState}>Финальный статус — изменения недоступны.</p>
              )}
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

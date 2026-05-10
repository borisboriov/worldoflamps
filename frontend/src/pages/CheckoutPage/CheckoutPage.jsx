import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, selectCartItems, selectCartTotals } from '../../store/slices/cartSlice';
import { placeOrder } from '../../store/slices/ordersSlice';
import s from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const { totalItems, totalPrice } = useSelector(selectCartTotals);
  const status = useSelector((state) => state.orders.status);
  const apiError = useSelector((state) => state.orders.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    comment: '',
    payment: 'cash',
  });
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div className={s.page}>
        <h1 className={s.title}>Оформление заказа</h1>
        <p>Ваша корзина пуста. <Link to="/catalog">Перейти в каталог</Link></p>
      </div>
    );
  }

  function validate() {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Обязательное поле';
    if (!form.customer_phone.trim()) e.customer_phone = 'Обязательное поле';
    if (!form.customer_address.trim()) e.customer_address = 'Обязательное поле';
    return e;
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_address: form.customer_address.trim(),
      comment: form.comment.trim() || undefined,
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };
    const snapshot = {
      orderItems: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      total: totalPrice,
    };

    const result = await dispatch(placeOrder({ payload, snapshot }));
    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      navigate('/confirmation');
    }
  }

  function field(key, label, placeholder, type = 'input') {
    const isErr = !!errors[key];
    const required = key !== 'comment';
    const props = {
      id: key,
      value: form[key],
      placeholder,
      onChange: (ev) => set(key, ev.target.value),
      className: `${type === 'textarea' ? s.textarea : s.input} ${isErr ? s.inputError : ''}`,
    };
    return (
      <div className={s.group}>
        <label htmlFor={key} className={s.label}>
          {label}{required && <span className={s.required}>*</span>}
        </label>
        {type === 'textarea' ? <textarea {...props} /> : <input {...props} />}
        {isErr && <span className={s.error}>{errors[key]}</span>}
      </div>
    );
  }

  const loading = status === 'loading';

  return (
    <div className={s.page}>
      <h1 className={s.title}>Оформление заказа</h1>
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        {field('customer_name', 'Имя', 'Иван Петров')}
        {field('customer_phone', 'Телефон', '+7 900 123-45-67')}
        {field('customer_address', 'Адрес доставки', 'г. Москва, ул. Ленина, д. 1')}
        {field('comment', 'Комментарий', 'Пожелания к доставке...', 'textarea')}

        <div className={s.payment}>
          <div className={s.paymentTitle}>Способ оплаты</div>
          <label className={s.radioOption}>
            <input type="radio" name="payment" value="cash" checked={form.payment === 'cash'} onChange={() => set('payment', 'cash')} />
            Оплата при получении
          </label>
          <label className={s.radioOption}>
            <input type="radio" name="payment" value="invoice" checked={form.payment === 'invoice'} onChange={() => set('payment', 'invoice')} />
            По счёту (для юрлиц)
          </label>
        </div>

        <div className={s.summary}>
          <span className={s.summaryTotal}>
            Итого: <span className={s.summaryVal}>{parseFloat(totalPrice).toLocaleString('ru-RU')} ₽</span>
          </span>
          <span className={s.summaryCount}>({totalItems} позиции)</span>
        </div>

        {apiError && <div className={s.apiError}>{apiError}</div>}

        <button type="submit" className={s.submitBtn} disabled={loading}>
          {loading ? 'Оформляем…' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts, fetchCategories,
  createProductThunk, updateProductThunk, deleteProductThunk,
  clearError,
} from '../../store/slices/productsSlice';
import Modal from '../../components/Modal/Modal';
import s from './ProductsPage.module.css';

const empty = { name: '', category_id: '', description: '', price: '', stock: '' };

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { items, categories, status, error } = useSelector((state) => state.adminProducts);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | {} | product
  const [form, setForm] = useState(empty);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchProducts(search ? { search } : {}));
    }, 300);
    return () => clearTimeout(t);
  }, [dispatch, search]);

  function openCreate() {
    setEditing({});
    setForm({ ...empty, category_id: categories[0]?.id || '' });
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      category_id: product.category.id,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
  }

  function close() {
    setEditing(null);
    setForm(empty);
    dispatch(clearError());
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    const action = editing.id
      ? updateProductThunk({ id: editing.id, payload })
      : createProductThunk(payload);
    const res = await dispatch(action);
    if (!res.payload?.message && !res.error) close();
    if (res.meta?.requestStatus === 'fulfilled') close();
  }

  async function handleDelete(id) {
    await dispatch(deleteProductThunk(id));
    setConfirmDel(null);
  }

  const loading = status === 'loading';

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Товары</h1>
        <button className={s.primaryBtn} onClick={openCreate}>+ Добавить товар</button>
      </div>

      <div className={s.toolbar}>
        <input
          className={s.search}
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan="6" className={s.empty}>Загрузка…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan="6" className={s.empty}>Товаров не найдено</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id}>
                <td className={s.mono}>{p.id}</td>
                <td>
                  <div className={s.name}>{p.name}</div>
                  <div className={s.slug}>{p.slug}</div>
                </td>
                <td>{p.category.name}</td>
                <td className={s.mono}>{parseFloat(p.price).toLocaleString('ru-RU')} ₽</td>
                <td className={s.mono}>{p.stock}</td>
                <td>
                  <div className={s.actions}>
                    <button className={s.editBtn} onClick={() => openEdit(p)} title="Редактировать">✎</button>
                    <button className={s.delBtn} onClick={() => setConfirmDel(p)} title="Удалить">×</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal
          title={editing.id ? `Редактировать: ${editing.name}` : 'Новый товар'}
          onClose={close}
          footer={
            <>
              <button onClick={close} className={s.cancelBtn}>Отмена</button>
              <button onClick={submit} className={s.primaryBtn}>
                {editing.id ? 'Сохранить' : 'Создать'}
              </button>
            </>
          }
        >
          <form onSubmit={submit} className={s.form}>
            <label className={s.group}>
              <span className={s.label}>Название *</span>
              <input
                className={s.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className={s.group}>
              <span className={s.label}>Категория *</span>
              <select
                className={s.input}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">— выберите —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className={s.row}>
              <label className={s.group}>
                <span className={s.label}>Цена ₽ *</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={s.input}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </label>
              <label className={s.group}>
                <span className={s.label}>Остаток *</span>
                <input
                  type="number"
                  min="0"
                  className={s.input}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className={s.group}>
              <span className={s.label}>Описание</span>
              <textarea
                className={s.textarea}
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </form>
        </Modal>
      )}

      {confirmDel && (
        <Modal
          title="Удалить товар?"
          onClose={() => setConfirmDel(null)}
          footer={
            <>
              <button onClick={() => setConfirmDel(null)} className={s.cancelBtn}>Отмена</button>
              <button onClick={() => handleDelete(confirmDel.id)} className={s.dangerBtn}>Удалить</button>
            </>
          }
        >
          <p>
            Товар <strong>«{confirmDel.name}»</strong> будет помечен как неактивный
            и перестанет показываться в магазине.
          </p>
        </Modal>
      )}
    </div>
  );
}

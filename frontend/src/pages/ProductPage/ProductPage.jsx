import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../../api/products';
import { useCart } from '../../context/CartContext';
import s from './ProductPage.module.css';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setNotFound(false);
    setProduct(null);
    getProduct(slug)
      .then(setProduct)
      .catch(() => setNotFound(true));
  }, [slug]);

  function handleAdd() {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (notFound) return <div className={s.notFound}>Товар не найден.</div>;
  if (!product) return <div className={s.notFound}>Загрузка…</div>;

  const inStock = product.stock > 0;
  const stockClass = product.stock > 10 ? s.stock : product.stock > 0 ? s.stockLow : s.outOfStock;
  const stockLabel = product.stock > 10
    ? `В наличии: ${product.stock} шт.`
    : product.stock > 0
    ? `Осталось: ${product.stock} шт.`
    : 'Нет в наличии';

  return (
    <div className={s.page}>
      <Link to="/catalog" className={s.back}>&lt;&lt; Назад в каталог</Link>
      <div className={s.card}>
        <div className={s.imageWrap}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className={s.image} />
            : <span className={s.placeholder}>💡</span>
          }
        </div>
        <div className={s.info}>
          <span className={s.categoryBadge}>{product.category.name}</span>
          <h1 className={s.name}>{product.name}</h1>
          <span className={s.price}>{parseFloat(product.price).toLocaleString('ru-RU')} ₽</span>
          <span className={stockClass}>{stockLabel}</span>
          {product.description && <p className={s.description}>{product.description}</p>}

          {inStock && (
            <>
              <div className={s.qtyRow}>
                <button className={s.qtyBtn} disabled={qty <= 1} onClick={() => setQty(q => q - 1)}>−</button>
                <span className={s.qtyNum}>{qty}</span>
                <button className={s.qtyBtn} disabled={qty >= product.stock} onClick={() => setQty(q => q + 1)}>+</button>
                <button className={s.addBtn} onClick={handleAdd}>В корзину</button>
              </div>
              {added && <span className={s.toast}>✓ Добавлено в корзину!</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

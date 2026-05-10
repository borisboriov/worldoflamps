import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import s from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const inStock = product.stock > 0;

  return (
    <div className={s.card}>
      <div className={s.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={s.image} />
        ) : (
          <span className={s.placeholder}>💡</span>
        )}
      </div>
      <div className={s.body}>
        <span className={s.category}>{product.category.name}</span>
        <Link to={`/products/${product.slug}`} className={s.name}>{product.name}</Link>
      </div>
      <div className={s.footer}>
        <span className={s.price}>{parseFloat(product.price).toLocaleString('ru-RU')} ₽</span>
        {inStock ? (
          <button className={s.btn} onClick={() => dispatch(addItem(product))}>В корзину</button>
        ) : (
          <span className={s.outOfStock}>Нет в наличии</span>
        )}
      </div>
    </div>
  );
}

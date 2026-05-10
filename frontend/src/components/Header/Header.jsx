import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartTotals } from '../../store/slices/cartSlice';
import s from './Header.module.css';

export default function Header() {
  const { totalItems } = useSelector(selectCartTotals);

  return (
    <header className={s.header}>
      <Link to="/" className={s.logo}>
        <span className={s.logoSquare} />
        WorldOfLamps
      </Link>
      <nav className={s.nav}>
        <NavLink to="/catalog" className={s.navLink}>Каталог</NavLink>
        <NavLink to="/orders" className={s.navLink}>Заказы</NavLink>
        <Link to="/cart" className={s.cartLink}>
          Корзина{totalItems > 0 && <span className={s.badge}>{totalItems}</span>}
        </Link>
      </nav>
    </header>
  );
}

import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import s from './Header.module.css';

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className={s.header}>
      <Link to="/" className={s.logo}>
        <span className={s.logoSquare} />
        WorldOfLamps
      </Link>
      <nav className={s.nav}>
        <NavLink to="/catalog" className={s.navLink}>Каталог</NavLink>
        <Link to="/cart" className={s.cartLink}>
          Корзина{totalItems > 0 && <span className={s.badge}>{totalItems}</span>}
        </Link>
      </nav>
    </header>
  );
}

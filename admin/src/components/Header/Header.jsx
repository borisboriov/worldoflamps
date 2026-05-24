import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import s from './Header.module.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  if (!token) return null;

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <header className={s.header}>
      <Link to="/" className={s.logo}>
        <span className={s.dot} />
        WorldOfLamps · Админ
      </Link>
      <nav className={s.nav}>
        <NavLink to="/products" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
          Товары
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
          Заказы
        </NavLink>
      </nav>
      <div className={s.right}>
        <span className={s.user}>{user?.username || 'admin'}</span>
        <button className={s.logoutBtn} onClick={handleLogout}>Выйти</button>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, selectIsAuthenticated } from '../../store/slices/authSlice';
import s from './LoginPage.module.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname || '/products';

  useEffect(() => {
    if (isAuth) navigate(from, { replace: true });
  }, [isAuth, navigate, from]);

  if (isAuth) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    dispatch(loginThunk({ username: username.trim(), password }));
  }

  const loading = status === 'loading';

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logoRow}>
          <span className={s.dot} />
          <h1 className={s.title}>WorldOfLamps · Админ-панель</h1>
        </div>
        <p className={s.subtitle}>Вход для администраторов</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <label className={s.group}>
            <span className={s.label}>Логин</span>
            <input
              type="text"
              className={s.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="admin"
            />
          </label>

          <label className={s.group}>
            <span className={s.label}>Пароль</span>
            <input
              type="password"
              className={s.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error && <div className={s.error}>{error}</div>}

          <button type="submit" className={s.submitBtn} disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className={s.hint}>
          По умолчанию: <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}

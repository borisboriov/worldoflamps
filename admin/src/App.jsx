import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import Header from './components/Header/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = () => dispatch(logout());
    window.addEventListener('admin:unauthorized', handler);
    return () => window.removeEventListener('admin:unauthorized', handler);
  }, [dispatch]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/" element={<Navigate to="/products" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

let prevCartItems = store.getState().cart.items;
let prevOrderNumbers = store.getState().orders.myOrderNumbers;
let prevOfflineOrders = store.getState().orders.offlineOrders;

store.subscribe(() => {
  const state = store.getState();

  if (state.cart.items !== prevCartItems) {
    prevCartItems = state.cart.items;
    try {
      localStorage.setItem('cart', JSON.stringify(state.cart.items));
    } catch { /* ignore */ }
  }

  if (state.orders.myOrderNumbers !== prevOrderNumbers) {
    prevOrderNumbers = state.orders.myOrderNumbers;
    try {
      localStorage.setItem('myOrderNumbers', JSON.stringify(state.orders.myOrderNumbers));
    } catch { /* ignore */ }
  }

  if (state.orders.offlineOrders !== prevOfflineOrders) {
    prevOfflineOrders = state.orders.offlineOrders;
    try {
      localStorage.setItem('offlineOrders', JSON.stringify(state.orders.offlineOrders));
    } catch { /* ignore */ }
  }
});

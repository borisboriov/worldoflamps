import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder as createOrderApi, getOrder as getOrderApi } from '../../api/orders';

function loadMyOrderNumbers() {
  try {
    const saved = localStorage.getItem('myOrderNumbers');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadOfflineOrders() {
  try {
    const saved = localStorage.getItem('offlineOrders');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ payload, snapshot }, { rejectWithValue }) => {
    try {
      const order = await createOrderApi(payload);
      return { order, snapshot };
    } catch (e) {
      return rejectWithValue(e.message || 'Ошибка при оформлении заказа');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { getState }) => {
    const { myOrderNumbers, offlineOrders } = getState().orders;
    const results = await Promise.allSettled(
      myOrderNumbers.map((num) => getOrderApi(num))
    );
    return results.map((r, i) => {
      const num = myOrderNumbers[i];
      if (r.status === 'fulfilled') return r.value;
      const fallback = offlineOrders[num];
      if (fallback) return { ...fallback, _offline: true };
      return { order_number: num, _missing: true };
    });
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    last: null,
    myOrderNumbers: loadMyOrderNumbers(),
    offlineOrders: loadOfflineOrders(),
    myOrders: [],
    myOrdersStatus: 'idle',
    status: 'idle',
    error: null,
  },
  reducers: {
    clearLast(state) {
      state.last = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.last = action.payload;
        const num = action.payload.order.order_number;
        if (num && !state.myOrderNumbers.includes(num)) {
          state.myOrderNumbers.unshift(num);
        }
        state.offlineOrders[num] = {
          ...action.payload.order,
          items_snapshot: action.payload.snapshot.orderItems,
        };
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка при оформлении заказа';
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrdersStatus = 'loading';
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrdersStatus = 'succeeded';
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.myOrdersStatus = 'failed';
      });
  },
});

export const { clearLast } = ordersSlice.actions;
export default ordersSlice.reducer;

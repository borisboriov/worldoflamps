import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listOrders, getOrder, updateOrderStatus } from '../../api/orders';

export const fetchOrders = createAsyncThunk(
  'adminOrders/fetchOrders',
  async (params = {}) => listOrders({ per_page: 50, ...params })
);

export const fetchOrderDetail = createAsyncThunk(
  'adminOrders/fetchOrderDetail',
  async (idOrNumber) => getOrder(idOrNumber)
);

export const changeStatusThunk = createAsyncThunk(
  'adminOrders/changeStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const order = await updateOrderStatus(id, status);
      dispatch(fetchOrders());
      return order;
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось изменить статус');
    }
  }
);

const slice = createSlice({
  name: 'adminOrders',
  initialState: {
    items: [],
    total: 0,
    detail: null,
    detailStatus: 'idle',
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
    clearDetail(state) { state.detail = null; state.detailStatus = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchOrderDetail.pending, (state) => { state.detailStatus = 'loading'; })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state) => { state.detailStatus = 'failed'; })
      .addCase(changeStatusThunk.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearError, clearDetail } = slice.actions;
export default slice.reducer;

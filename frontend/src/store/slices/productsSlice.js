import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts, getCategories, getProduct } from '../../api/products';

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => getCategories()
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}) => getProducts(params)
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await getProduct(slug);
    } catch (e) {
      return rejectWithValue(e.message || 'Not found');
    }
  }
);

const initialState = {
  list: { items: [], total: 0, page: 1, per_page: 12, pages: 1 },
  listStatus: 'idle',
  categories: [],
  current: null,
  currentStatus: 'idle',
  currentError: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.list = action.payload;
        state.listStatus = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.listStatus = 'failed';
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.currentStatus = 'loading';
        state.current = null;
        state.currentError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.current = action.payload;
        state.currentStatus = 'succeeded';
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload || 'Not found';
      });
  },
});

export const { clearCurrent } = productsSlice.actions;
export default productsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listProducts, listCategories,
  createProduct as createApi,
  updateProduct as updateApi,
  deleteProduct as deleteApi,
} from '../../api/products';

export const fetchCategories = createAsyncThunk(
  'adminProducts/fetchCategories',
  async () => listCategories()
);

export const fetchProducts = createAsyncThunk(
  'adminProducts/fetchProducts',
  async (params = {}) => listProducts({ per_page: 50, ...params })
);

export const createProductThunk = createAsyncThunk(
  'adminProducts/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const product = await createApi(payload);
      dispatch(fetchProducts());
      return product;
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось создать товар');
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'adminProducts/update',
  async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const product = await updateApi(id, payload);
      dispatch(fetchProducts());
      return product;
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось обновить товар');
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'adminProducts/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteApi(id);
      dispatch(fetchProducts());
      return id;
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось удалить товар');
    }
  }
);

const slice = createSlice({
  name: 'adminProducts',
  initialState: {
    items: [],
    total: 0,
    categories: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createProductThunk.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateProductThunk.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteProductThunk.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;

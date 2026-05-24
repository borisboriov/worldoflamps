import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, me as meApi } from '../../api/auth';

function loadToken() {
  try { return localStorage.getItem('admin_token') || null; } catch { return null; }
}
function loadUser() {
  try {
    const u = localStorage.getItem('admin_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      return await loginApi(username, password);
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось войти');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      return await meApi();
    } catch (e) {
      return rejectWithValue(e.message || 'Сессия истекла');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: loadToken(),
    user: loadUser(),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      try {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } catch { /* ignore */ }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        try {
          localStorage.setItem('admin_token', action.payload.access_token);
          localStorage.setItem('admin_user', JSON.stringify(action.payload.user));
        } catch { /* ignore */ }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка входа';
      })
      .addCase(verifyToken.rejected, (state) => {
        state.token = null;
        state.user = null;
        try {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } catch { /* ignore */ }
      });
  },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export default authSlice.reducer;

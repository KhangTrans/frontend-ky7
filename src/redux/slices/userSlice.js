import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosConfig';

// Async thunk để lấy danh sách users với filter và pagination
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.role) queryParams.append('role', params.role);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/users?${queryString}` : '/users';
      
      const response = await axiosInstance.get(url);
      return {
        users: response.data.data || [],
        pagination: {
          page: response.data.currentPage || 1,
          limit: params.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          count: response.data.count || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    }
  }
);

// Async thunk để lấy chi tiết user
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin người dùng');
    }
  }
);

// Async thunk để tạo user mới
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo người dùng');
    }
  }
);

// Async thunk để cập nhật user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, userData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  }
);

// Async thunk để xóa user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      count: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((user) => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;

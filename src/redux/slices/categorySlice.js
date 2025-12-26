import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosConfig';

// Async thunk để lấy danh sách categories với filter và pagination
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string từ params (URLSearchParams tự encode UTF-8)
      const queryParams = new URLSearchParams();
      
      if (params.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/categories?${queryString}` : '/categories';
      
      console.log('Fetching categories with URL:', url); // Debug log
      
      const response = await axiosInstance.get(url);
      console.log('API Response:', response.data); // Debug log
      
      // Response structure: { success, count, data }
      return {
        categories: response.data.data || [],
        pagination: {
          page: response.data.currentPage || 1,
          limit: params.limit || 10,
          total: response.data.total || response.data.count || 0,
          totalPages: response.data.totalPages || 1,
          count: response.data.count || 0,
        },
      };
    } catch (error) {
      console.error('Fetch categories error:', error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Không thể tải danh sách thể loại';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk để tạo category mới
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/categories', categoryData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo thể loại');
    }
  }
);

// Async thunk để cập nhật category
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, categoryData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật thể loại');
    }
  }
);

// Async thunk để xóa category
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa thể loại');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentCategory: null,
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
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload._id || action.payload.id;
        const index = state.items.findIndex((cat) => (cat._id || cat.id) === id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload là id đã xóa
        state.items = state.items.filter((cat) => {
          const catId = cat._id || cat.id;
          return catId !== action.payload;
        });
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;

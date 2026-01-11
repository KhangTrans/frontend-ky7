import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  // Change input param to itemId
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(itemId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeFromCart(itemId);
      return { ...response, itemId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.clearCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  }
);

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Cập nhật local cart count (cho trường hợp không cần fetch lại)
    updateCartCount: (state, action) => {
      state.totalQuantity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Logic parse response structure: { success: true, data: { cart: { items: [...] }, summary: {...} } }
        const data = action.payload.data || action.payload;
        const cart = data.cart || data;

        state.items = cart.items || [];
        // Tự tính toán totalQuantity để đảm bảo chính xác
        state.totalQuantity = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        state.totalPrice = cart.totalPrice || state.items.reduce((sum, item) => sum + ((item.productId?.salePrice || item.productId?.price || 0) * item.quantity), 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Tương tự, parse structure cho add to cart response
        const data = action.payload.data || action.payload;
        const cart = data.cart || data;
        
        if (cart && cart.items) {
          state.items = cart.items || [];
        }
        
        // Tự tính lại quantity sau khi add
        state.totalQuantity = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        if (cart) {
           state.totalPrice = cart.totalPrice || 0;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        // Không set loading = true để tránh re-render toàn bộ trang
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        
        // Response structure: { success: true, data: { _id, productId, quantity, price, ... } }
        const updatedItem = action.payload.data || action.payload;

        if (updatedItem && updatedItem._id) {
          // Update specific item in the list
          const index = state.items.findIndex(item => item._id === updatedItem._id);
          if (index !== -1) {
            state.items[index] = { 
               ...state.items[index], 
               ...updatedItem,
               // Ensure productId is preserved if backend returns only ID or populated object
               productId: state.items[index].productId 
            };
          }
          
          // Recalculate totals
          state.totalQuantity = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
          state.totalPrice = state.items.reduce((sum, item) => {
             const price = item.productId?.salePrice || item.productId?.price || item.price || 0;
             return sum + (price * item.quantity);
          }, 0);
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        // state.loading = true; // Disable loading to prevent flicker
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || action.payload;
        const cart = data.cart || data;
        const summary = data.summary || {};

        if (cart && cart.items) {
          state.items = cart.items || [];
          state.totalQuantity = summary.totalQuantity || cart.totalQuantity || 0;
          state.totalPrice = summary.subtotal ? parseFloat(summary.subtotal) : (cart.totalPrice || 0);
        } else {
           // Optimistic update fallback
           state.items = state.items.filter(item => {
             return item._id !== action.payload.itemId;
           });
           state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateCartCount } = cartSlice.actions;
export default cartSlice.reducer;

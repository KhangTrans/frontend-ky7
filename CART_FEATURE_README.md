# Chức năng Giỏ hàng (Shopping Cart)

## 📋 Tổng quan

Chức năng giỏ hàng cho phép người dùng thêm sản phẩm vào giỏ, quản lý số lượng, và xem tổng giá trị đơn hàng. Tính năng này **yêu cầu đăng nhập** và sử dụng token authentication.

## 🔐 API Endpoint

### POST /api/cart - Thêm sản phẩm vào giỏ hàng

**Yêu cầu xác thực:** Có (cần token trong header)

**Request Body:**

```json
{
  "productId": "ID_sản_phẩm",
  "quantity": 1
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào giỏ hàng",
  "cart": {
    "items": [
      {
        "productId": "...",
        "quantity": 1,
        "product": {
          /* Product details */
        }
      }
    ],
    "totalQuantity": 1,
    "totalPrice": 299000
  }
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Unauthorized - Please login"
}
```

## 🎯 Tính năng đã triển khai

### 1. **Redux State Management**

- ✅ Cart Slice với các async thunks:
  - `fetchCart()` - Lấy giỏ hàng từ server
  - `addToCart()` - Thêm sản phẩm vào giỏ
  - `updateCartItem()` - Cập nhật số lượng
  - `removeFromCart()` - Xóa sản phẩm
  - `clearCart()` - Xóa toàn bộ giỏ hàng

### 2. **API Integration**

- ✅ Cart API trong `src/api/index.js`
- ✅ Sử dụng axios instance với interceptor
- ✅ Tự động gửi token trong header

### 3. **UI/UX Features**

#### Trang Home

- ✅ **Authentication Check**: Kiểm tra đăng nhập trước khi thêm vào giỏ
- ✅ **Login Modal**: Hiển thị modal yêu cầu đăng nhập nếu chưa login
- ✅ **Success Notification**: Thông báo khi thêm thành công
- ✅ **Error Handling**: Xử lý lỗi khi API call thất bại
- ✅ **Loading State**: Hiển thị trạng thái đang xử lý

#### HomeNavbar

- ✅ **Cart Badge**: Hiển thị số lượng sản phẩm trong giỏ
- ✅ **Real-time Update**: Cập nhật số lượng ngay sau khi thêm
- ✅ **Auto Load**: Tự động load giỏ hàng khi component mount (nếu đã login)

## 📁 Cấu trúc Files

```
src/
├── api/
│   └── index.js                    # Thêm cartAPI với 5 methods
├── redux/
│   ├── slices/
│   │   └── cartSlice.js           # Redux cart slice (NEW)
│   └── store.js                    # Thêm cart reducer
├── components/
│   └── HomeNavbar/
│       └── index.jsx               # Hiển thị cart badge
└── pages/
    └── Home/
        └── index.jsx               # Thêm vào giỏ hàng
```

## 🚀 Cách sử dụng

### Từ phía người dùng:

1. **Đăng nhập** vào hệ thống
2. Truy cập **trang Home** (`/`)
3. **Click nút "Thêm"** trên product card
4. Sản phẩm được thêm vào giỏ hàng
5. **Badge trên icon giỏ hàng** sẽ cập nhật số lượng

### Từ phía developer:

#### 1. Thêm sản phẩm vào giỏ hàng

```javascript
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";

const handleAddToCart = async (product) => {
  try {
    await dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
      })
    ).unwrap();

    message.success("Đã thêm vào giỏ hàng!");
  } catch (error) {
    message.error(error);
  }
};
```

#### 2. Lấy giỏ hàng

```javascript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";

const MyComponent = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice, loading } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div>
      <p>Tổng số sản phẩm: {totalQuantity}</p>
      <p>Tổng giá: {totalPrice.toLocaleString("vi-VN")}đ</p>
    </div>
  );
};
```

#### 3. Cập nhật số lượng

```javascript
dispatch(
  updateCartItem({
    productId: "123",
    quantity: 5,
  })
);
```

#### 4. Xóa sản phẩm

```javascript
dispatch(removeFromCart("productId123"));
```

#### 5. Xóa toàn bộ giỏ hàng

```javascript
dispatch(clearCart());
```

## 🎨 Redux State Structure

```javascript
cart: {
  items: [
    {
      productId: "abc123",
      quantity: 2,
      product: {
        _id: "abc123",
        name: "Áo sơ mi",
        price: 299000,
        images: [...]
      }
    }
  ],
  totalQuantity: 2,      // Tổng số sản phẩm
  totalPrice: 598000,    // Tổng giá trị
  loading: false,        // Trạng thái loading
  error: null            // Thông báo lỗi
}
```

## 🔒 Authentication Flow

```
User clicks "Thêm"
       ↓
Check isLoggedIn?
       ↓
YES → Call API → Update Redux → Show success
       ↓
NO  → Show Modal → Redirect to /login
```

## ⚙️ Configuration

### Axios Config (đã có sẵn)

File: `src/api/axiosConfig.js`

```javascript
// Auto include token in headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🐛 Error Handling

### 1. Chưa đăng nhập

- Hiển thị Modal yêu cầu đăng nhập
- Redirect đến `/login` khi user click OK

### 2. Token hết hạn

- Axios interceptor tự động refresh token
- Nếu refresh thất bại → Redirect về login

### 3. API Error

- Hiển thị message.error với thông báo lỗi
- Log error ra console để debug

### 4. Network Error

- Hiển thị "Không thể kết nối đến server"
- Retry logic có thể được thêm vào sau

## 📊 Cart Badge Design

```css
Badge Position: top-right của Shopping Cart icon
Badge Color: Primary (red)
Badge Max Count: 99+
Badge Size: Small
Animation: Scale bounce khi count thay đổi
```

## ✨ Future Enhancements

- [ ] **Cart Drawer/Modal**: Sidebar hiển thị chi tiết giỏ hàng
- [ ] **Quantity Selector**: Chọn số lượng trước khi thêm vào giỏ
- [ ] **Cart Page**: Trang giỏ hàng riêng biệt (`/cart`)
- [ ] **Local Storage Sync**: Đồng bộ giỏ hàng với localStorage
- [ ] **Cart Persistence**: Lưu giỏ hàng khi logout
- [ ] **Mini Cart Preview**: Hover vào icon giỏ hàng để xem nhanh
- [ ] **Remove Confirmation**: Xác nhận trước khi xóa sản phẩm
- [ ] **Promo Code**: Nhập mã giảm giá
- [ ] **Checkout Flow**: Quy trình thanh toán

## 🧪 Testing

### Test Cases

1. **Thêm sản phẩm khi chưa đăng nhập**

   - Expected: Hiển thị modal yêu cầu login

2. **Thêm sản phẩm khi đã đăng nhập**

   - Expected: API call thành công, badge cập nhật

3. **Thêm cùng sản phẩm nhiều lần**

   - Expected: Tăng quantity thay vì tạo item mới

4. **Badge update real-time**

   - Expected: Badge hiển thị đúng số lượng sau mỗi thao tác

5. **Token expired**
   - Expected: Refresh token hoặc redirect login

## 📝 API Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào giỏ hàng",
  "cart": {
    "userId": "user123",
    "items": [
      {
        "productId": "prod456",
        "quantity": 2,
        "price": 299000,
        "product": {
          "_id": "prod456",
          "name": "Áo sơ mi nam",
          "images": [...]
        }
      }
    ],
    "totalQuantity": 2,
    "totalPrice": 598000,
    "createdAt": "2026-01-10T12:00:00Z",
    "updatedAt": "2026-01-10T12:37:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Sản phẩm không tồn tại"
}
```

## 🎯 Performance Optimizations

1. **Optimistic UI Updates**: Cập nhật UI ngay, không đợi API response
2. **Debounce**: Giảm số lần gọi API khi update quantity
3. **Memoization**: Sử dụng useMemo cho cart calculations
4. **Lazy Loading**: Load cart data chỉ khi cần thiết

---

**Note**: Đảm bảo backend API đang chạy và endpoint `/api/cart` đã được implement đúng theo spec trên.

# Trang Home - Hướng dẫn sử dụng

## 📋 Tổng quan

Trang Home là trang chủ công khai của ứng dụng e-commerce, hiển thị tất cả sản phẩm với tính năng lọc theo danh mục. Trang này **không yêu cầu đăng nhập** và có thể truy cập trực tiếp tại đường dẫn gốc `/`.

## 🎯 Tính năng chính

### 1. **Navbar công khai**

- Logo và tên shop
- Menu điều hướng (Trang chủ, Sản phẩm, Danh mục, Về chúng tôi)
- Icon giỏ hàng và danh sách yêu thích
- Nút đăng nhập/Tài khoản (tùy theo trạng thái đăng nhập)
- Responsive menu cho mobile

### 2. **Hero Section**

- Banner gradient đẹp mắt với hiệu ứng animation
- Thanh tìm kiếm nổi bật
- Animated background shapes
- Tiêu đề và subtitle thu hút

### 3. **Bộ lọc danh mục**

- Hiển thị tất cả danh mục dưới dạng chips
- Chip "Tất cả" để xem toàn bộ sản phẩm
- Hiển thị số lượng sản phẩm trong mỗi danh mục
- Active state với gradient purple

### 4. **Lưới sản phẩm**

- Responsive grid layout (4 cột → 3 cột → 2 cột → 1 cột)
- Product cards hiện đại với:
  - Hình ảnh sản phẩm
  - Tag danh mục
  - Tên và mô tả sản phẩm
  - Giá (hỗ trợ giá gốc và giá khuyến mãi)
  - Nút "Thêm vào giỏ hàng"
  - Badge "Hết hàng" / "Sắp hết" tùy theo tồn kho
- Hover effects:
  - Card elevation
  - Image zoom
  - Overlay với nút Yêu thích và Xem chi tiết

### 5. **Tìm kiếm**

- Tìm kiếm theo tên sản phẩm
- Tìm kiếm theo mô tả
- Real-time filtering

## 🗂️ Cấu trúc Routes

```javascript
// Public routes (không cần đăng nhập)
/ hoặc /home          → Trang Home (hiển thị sản phẩm)
/login                → Trang đăng nhập

// Protected routes (cần đăng nhập)
/dashboard            → Dashboard quản trị
/products             → Quản lý sản phẩm
/categories           → Quản lý danh mục
```

## 📁 Cấu trúc Files

```
src/
├── components/
│   └── HomeNavbar/
│       ├── index.jsx           # Navbar component
│       └── HomeNavbar.css      # Navbar styles
├── pages/
│   └── Home/
│       ├── index.jsx           # Home page component
│       └── Home.css            # Home page styles
└── routes/
    ├── routes.config.js        # Cấu hình routing
    └── components.js           # Components mapping
```

## 🎨 Thiết kế

### Color Palette

- **Primary Gradient**: `#667eea` → `#764ba2` (Purple gradient)
- **Background**: `#f5f7fa` → `#e8ecf1` (Light gradient)
- **Text**: `#2d3748` (Dark gray)
- **Secondary Text**: `#718096` (Medium gray)

### Animations

- Fade in up cho hero content
- Slide up cho product cards
- Float animation cho background shapes
- Smooth hover transitions
- Pulse animation

### Responsive Breakpoints

- Desktop: > 1200px (4 columns)
- Tablet: 768px - 1200px (3 columns)
- Mobile: 480px - 768px (2 columns)
- Small Mobile: < 480px (1 column)

## 🚀 Cách sử dụng

### 1. Truy cập trang

```
Mở trình duyệt và truy cập: http://localhost:5173/
```

### 2. Lọc sản phẩm theo danh mục

- Click vào chip danh mục bất kỳ
- Sản phẩm sẽ được lọc tự động
- Click "Tất cả" để xem lại toàn bộ

### 3. Tìm kiếm sản phẩm

- Nhập từ khóa vào thanh tìm kiếm ở Hero section
- Kết quả được cập nhật real-time

### 4. Thêm sản phẩm vào giỏ hàng

- Click nút "Thêm" trên product card
- Thông báo success sẽ hiện lên

### 5. Xem chi tiết sản phẩm

- Click vào product card
- Hoặc hover và click icon "Eye"

## 🔧 Tùy chỉnh

### Thay đổi số lượng sản phẩm hiển thị

```javascript
// Trong src/pages/Home/index.jsx
dispatch(fetchProducts({ page: 1, limit: 100 })); // Thay đổi limit
```

### Thêm danh mục mới

Danh mục được tải tự động từ API. Thêm danh mục mới qua trang quản lý `/categories`

### Thay đổi màu sắc

Chỉnh sửa file `src/pages/Home/Home.css` và cập nhật các biến màu

## 📱 Mobile Experience

- Hamburger menu cho navigation
- Optimized touch targets
- Responsive grid columns
- Bottom-aligned buttons
- Simplified layouts

## ⚡ Performance

- Lazy loading components
- Optimized images with error fallback
- Debounced search
- Minimal re-renders
- CSS animations (GPU accelerated)

## 🐛 Troubleshooting

### Sản phẩm không hiển thị

- Kiểm tra API endpoint `/products`
- Kiểm tra Redux state
- Mở DevTools và xem Network tab

### Lỗi hình ảnh

- Placeholder tự động hiển thị nếu ảnh lỗi
- Kiểm tra URL hình ảnh trong database

### Route không hoạt động

- Kiểm tra `src/routes/routes.config.js`
- Verify component mapping trong `src/routes/components.js`

## 🎯 Các tính năng sẽ phát triển

- [ ] Pagination cho danh sách sản phẩm
- [ ] Sắp xếp (giá thấp → cao, mới nhất, phổ biến)
- [ ] Quick view modal
- [ ] Product comparison
- [ ] Wishlist persistence
- [ ] Shopping cart sidebar
- [ ] Product reviews and ratings
- [ ] Related products

---

**Lưu ý**: Trang Home hiện tại đang kết nối với Redux store để lấy dữ liệu sản phẩm. Đảm bảo backend API đang chạy để có dữ liệu hiển thị.

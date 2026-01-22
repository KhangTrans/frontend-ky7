# Trang Quản Lý Người Dùng (User Management)

## Tổng quan
Trang Quản Lý Người Dùng cho phép admin quản lý toàn bộ người dùng trong hệ thống, bao gồm:
- Xem danh sách người dùng với phân trang
- Tìm kiếm và lọc người dùng
- Thêm người dùng mới
- Chỉnh sửa thông tin người dùng
- Xóa người dùng
- Quản lý vai trò (Admin/User) và trạng thái hoạt động

## Cấu trúc Files

```
src/
├── redux/
│   └── slices/
│       └── userSlice.js          # Redux slice cho user management
├── pages/
│   └── UserManagement/
│       ├── index.jsx              # Component chính
│       ├── UserFormModal.jsx     # Modal form thêm/sửa user
│       └── UserManagement.css    # Styling
└── routes/
    ├── routes.config.js           # Cấu hình route mới
    └── components.js              # Import component
```

## API Endpoints

### 1. Lấy danh sách người dùng
**GET** `/api/users`

**Query Params:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng item/trang (mặc định: 10)
- `role`: Lọc theo vai trò (`user` hoặc `admin`)
- `keyword`: Tìm kiếm theo username, email, hoặc fullName

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "user",
      "isActive": true,
      "avatar": "avatar_url",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Lấy chi tiết người dùng
**GET** `/api/users/:id`

**Response:** Object user (không bao gồm password)

### 3. Tạo người dùng mới
**POST** `/api/users`

**Body:**
```json
{
  "username": "john_doe",        // required, unique
  "email": "john@example.com",   // required, unique, valid email
  "password": "123456",          // required, min 6 chars
  "fullName": "John Doe",        // optional
  "role": "user",                // optional, default 'user'
  "isActive": true               // optional, default true
}
```

### 4. Cập nhật người dùng
**PUT** `/api/users/:id`

**Body:** Tương tự Create, không bắt buộc tất cả field. Không gửi password nếu không muốn đổi.

### 5. Xóa người dùng
**DELETE** `/api/users/:id`

## Tính năng

### 1. Danh sách người dùng
- **Table hiển thị:** Avatar, Username, Full Name, Email, Role, Status, Actions
- **Phân trang:** Hỗ trợ thay đổi số item/trang (10, 20, 50, 100)
- **Badges:** 
  - Role: 👑 Admin (red) / 👤 User (blue)
  - Status: ✓ Hoạt động (green) / ✗ Vô hiệu (gray)

### 2. Tìm kiếm & Lọc
- **Tìm kiếm:** Tìm theo username, email, hoặc fullName
- **Lọc theo vai trò:** Dropdown chọn Admin, User, hoặc Tất cả
- **Nút Làm mới:** Reset tất cả filter về mặc định

### 3. Thêm người dùng mới
**Fields bắt buộc:**
- Username (min 3 ký tự, chỉ chữ, số và _)
- Email (valid email format)
- Password (min 6 ký tự)

**Fields tùy chọn:**
- Full Name
- Role (User/Admin)
- Is Active (Active/Inactive)

**Validation:**
- Client-side validation cho tất cả fields
- Server-side validation sẽ return error nếu username/email đã tồn tại

### 4. Chỉnh sửa người dùng
- **Không thể sửa:** Username và Email
- **Có thể sửa:** Full Name, Role, Status
- **Password:** Để trống nếu không muốn đổi, nhập mới nếu muốn đổi

### 5. Xóa người dùng
- Hiển thị popup xác nhận trước khi xóa
- Warning: "Hành động này không thể hoàn tác!"

## Sử dụng

### 1. Truy cập trang
```
URL: /dashboard/users
```
**Yêu cầu:** Phải đăng nhập với role `admin`

### 2. Tìm kiếm người dùng
1. Nhập keyword vào ô tìm kiếm
2. Hoặc chọn Role từ dropdown
3. Click "Tìm kiếm" hoặc nhấn Enter

### 3. Thêm người dùng mới
1. Click nút "Thêm người dùng" (màu xanh lá)
2. Điền đầy đủ thông tin vào form
3. Chọn Role và Status
4. Click "Tạo mới"

### 4. Sửa người dùng
1. Click icon ✏️ ở cột Hành động
2. Sửa thông tin cần thiết
3. Nhập password mới nếu muốn đổi (để trống nếu không)
4. Click "Cập nhật"

### 5. Xóa người dùng
1. Click icon 🗑️ ở cột Hành động
2. Xác nhận trong popup
3. User sẽ bị xóa khỏi hệ thống

## Redux State Management

### State Structure
```javascript
{
  users: {
    items: [],           // Danh sách users
    currentUser: null,   // User hiện tại đang xem
    loading: false,      // Loading state
    error: null,         // Error message
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      count: 0
    }
  }
}
```

### Actions
- `fetchUsers(params)` - Lấy danh sách users
- `fetchUserById(userId)` - Lấy chi tiết 1 user
- `createUser(userData)` - Tạo user mới
- `updateUser({ userId, userData })` - Cập nhật user
- `deleteUser(userId)` - Xóa user
- `clearError()` - Xóa error message
- `clearCurrentUser()` - Clear current user

## Xử lý lỗi

### Client-side Validation
- Username: min 3 ký tự, chỉ chữ số và _
- Email: phải là email hợp lệ
- Password: min 6 ký tự
- Form sẽ highlight field lỗi với message tương ứng

### Server-side Error
Hiển thị toast message với các lỗi phổ biến:
- "Username đã tồn tại"
- "Email đã được sử dụng"
- "Không có quyền thực hiện hành động này"
- "Không tìm thấy người dùng"

### Loading State
- Hiển thị loading spinner khi gọi API
- Disable form submit button khi đang loading
- Table hiển thị skeleton loading

## Responsive Design
- **Desktop:** Hiển thị đầy đủ columns và actions
- **Tablet:** Collapse một số columns không quan trọng
- **Mobile:** Table có horizontal scroll, stack actions vertically

## Bảo mật
- ✅ Yêu cầu authentication với role admin
- ✅ Token được gửi trong header Authorization
- ✅ Password không bao giờ hiển thị trên UI
- ✅ Password mới được hash ở backend trước khi lưu
- ✅ Xác nhận trước khi xóa user

## Testing

### Test Cases cần kiểm tra:
1. ✅ Load danh sách users thành công
2. ✅ Pagination hoạt động đúng
3. ✅ Tìm kiếm theo keyword
4. ✅ Filter theo role
5. ✅ Tạo user mới với validation
6. ✅ Cập nhật user (không đổi password)
7. ✅ Cập nhật user (có đổi password)
8. ✅ Xóa user với confirmation
9. ✅ Xử lý lỗi khi username/email trùng
10. ✅ Xử lý lỗi khi không có quyền

## Troubleshooting

### Lỗi "Không thể tải danh sách người dùng"
- Kiểm tra token authentication
- Kiểm tra backend API có chạy không
- Kiểm tra role có phải admin không

### Lỗi "Username/Email đã tồn tại"
- Chọn username/email khác
- Backend đã validation unique constraint

### Không thấy menu "Người dùng"
- Đảm bảo đã đăng nhập với role admin
- Menu chỉ hiển thị cho admin users

## Cải tiến tương lai
- [ ] Bulk actions (xóa nhiều users cùng lúc)
- [ ] Export danh sách users ra CSV/Excel
- [ ] Upload avatar cho users
- [ ] Lịch sử hoạt động của user
- [ ] Reset password qua email
- [ ] 2FA (Two-Factor Authentication)
- [ ] User groups/permissions management

## Liên hệ
Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team development.

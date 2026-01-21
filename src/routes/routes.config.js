// Cấu hình routes thuần JSON (không có JSX)
const routesData = [
  {
    path: '/login',
    name: 'Login',
    component: 'Login',
    meta: {
      title: 'Đăng nhập',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/auth/google/success',
    name: 'GoogleCallback',
    component: 'GoogleCallback',
    meta: {
      title: 'Đăng nhập Google',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: 'Register',
    meta: {
      title: 'Đăng ký',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/',
    name: 'Home',
    component: 'Home',
    meta: {
      title: 'Trang chủ',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: 'ProductDetail',
    meta: {
      title: 'Chi tiết sản phẩm',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: 'Cart',
    meta: {
      title: 'Giỏ hàng',
      requiresAuth: true,
    },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: 'Checkout',
    meta: {
      title: 'Thanh toán',
      requiresAuth: true,
    },
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: 'PaymentCallback',
    meta: { title: 'Thanh toán thành công', requiresAuth: false },
  },
  {
    path: '/payment/failed',
    name: 'PaymentFailed',
    component: 'PaymentCallback',
    meta: { title: 'Thanh toán thất bại', requiresAuth: false },
  },
  {
    path: '/payment/vnpay/return',
    name: 'PaymentCallback',
    component: 'PaymentCallback',
    meta: {
      title: 'Kết quả thanh toán',
      requiresAuth: false, // Callback có thể không cần auth nếu chỉ verify code
    },
  },
  {
    path: '/payment/zalopay/return',
    name: 'PaymentCallback',
    component: 'PaymentCallback',
    meta: {
      title: 'Kết quả thanh toán',
      requiresAuth: false,
    },
  },
  {
    path: '/order-success',
    name: 'OrderSuccess',
    component: 'OrderSuccess',
    meta: {
      title: 'Đặt hàng thành công',
      requiresAuth: true,
    },
  },
  {
    path: '/mock-payment',
    name: 'MockPayment',
    component: 'MockPayment',
    meta: {
      title: 'Cổng thanh toán giả lập',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: 'Profile',
    meta: {
      title: 'Hồ sơ cá nhân',
      requiresAuth: true,
    },
  },
  {
    path: '/order-history',
    name: 'OrderHistory',
    component: 'OrderHistory',
    meta: {
      title: 'Lịch sử đơn hàng',
      requiresAuth: true,
    },
  },
  {
    path: '/addresses',
    name: 'AddressBook',
    component: 'AddressBook',
    meta: {
      title: 'Sổ địa chỉ',
      requiresAuth: true,
    },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: 'OrderDetail',
    meta: {
      title: 'Chi tiết đơn hàng',
      requiresAuth: true,
    },
  },
  {
    path: '/',
    name: 'DashboardLayout',
    component: 'DashboardLayout',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: 'DashboardContent',
        meta: {
          title: 'Dashboard',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'dashboard/orders',
        name: 'OrderManagement',
        component: 'OrderManagement',
        meta: {
          title: 'Quản lý đơn hàng',
          requiresAuth: true,
          roles: ['admin'],
        },
      },

      {
        path: 'dashboard/products',
        name: 'ProductManagement',
        component: 'ProductManagement',
        meta: {
          title: 'Quản lý sản phẩm',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'dashboard/categories',
        name: 'CategoryManagement',
        component: 'CategoryManagement',
        meta: {
          title: 'Quản lý thể loại',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: 'Settings',
        meta: {
          title: 'Cài đặt',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'dashboard/vouchers',
        name: 'VoucherManagement',
        component: 'VoucherManagement',
        meta: {
            title: 'Quản lý voucher',
            requiresAuth: true,
            roles: ['admin'],
        },
      },
    ],
  },
  {
    path: '*',
    name: 'NotFound',
    component: 'NotFound',
    meta: {
      title: 'Không tìm thấy trang',
      requiresAuth: false,
    },
  },
];

export default routesData;

// Cấu hình routes thuần JSON (không có JSX)
const routesData = [
  {
    path: '/',
    name: 'Login',
    component: 'Login',
    meta: {
      title: 'Đăng nhập',
      requiresAuth: false,
      public: true,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: 'Dashboard',
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      roles: ['admin', 'user'],
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: 'Profile',
    meta: {
      title: 'Hồ sơ',
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: 'Settings',
    meta: {
      title: 'Cài đặt',
      requiresAuth: true,
      roles: ['admin'],
    },
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

import { lazy } from 'react';

// Lazy load components để tối ưu performance
export const Login = lazy(() => import('../components/Login'));
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const NotFound = lazy(() => import('../pages/NotFound'));

// Thêm các pages khác ở đây khi cần
// export const Profile = lazy(() => import('../pages/Profile'));
// export const Settings = lazy(() => import('../pages/Settings'));

// Map string name to component
const componentsMap = {
  Login,
  Dashboard,
  NotFound,
  // Profile,
  // Settings,
};

export default componentsMap;

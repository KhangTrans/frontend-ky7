import { lazy } from 'react';
import DashboardLayout from '../components/DashboardLayout';

// Lazy load components để tối ưu performance
export const Login = lazy(() => import('../components/Login'));
export const DashboardContent = lazy(() => import('../pages/Dashboard/DashboardContent'));
export const ProductManagement = lazy(() => import('../pages/ProductManagement'));
export const CategoryManagement = lazy(() => import('../pages/CategoryManagement'));
export const NotFound = lazy(() => import('../pages/NotFound'));

// Thêm các pages khác ở đây khi cần
// export const Profile = lazy(() => import('../pages/Profile'));
// export const Settings = lazy(() => import('../pages/Settings'));

// Map string name to component
const componentsMap = {
  Login,
  DashboardLayout, // Layout không lazy load
  DashboardContent,
  ProductManagement,
  CategoryManagement,
  NotFound,
  // Tạm thời dùng DashboardContent
  Profile: DashboardContent,
  Settings: DashboardContent,
};

export default componentsMap;

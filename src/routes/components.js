import { lazy } from 'react';
import DashboardLayout from '../components/DashboardLayout';

// Lazy load components để tối ưu performance
export const Login = lazy(() => import('../components/Login'));
export const Register = lazy(() => import('../components/Register'));
export const VerifyEmail = lazy(() => import('../components/VerifyEmail'));
export const Home = lazy(() => import('../pages/Home'));
export const ProductDetail = lazy(() => import('../pages/ProductDetail'));
export const Cart = lazy(() => import('../pages/Cart'));
export const Checkout = lazy(() => import('../pages/Checkout'));
export const PaymentCallback = lazy(() => import('../pages/PaymentCallback'));
export const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
export const OrderDetail = lazy(() => import('../pages/OrderDetail')); // Thêm mới
export const MockPayment = lazy(() => import('../pages/MockPayment'));
export const GoogleCallback = lazy(() => import('../components/GoogleCallback'));
export const DashboardContent = lazy(() => import('../pages/Dashboard/DashboardContent'));
export const ProductManagement = lazy(() => import('../pages/ProductManagement'));
export const CategoryManagement = lazy(() => import('../pages/CategoryManagement'));
export const UserManagement = lazy(() => import('../pages/UserManagement'));
export const NotFound = lazy(() => import('../pages/NotFound'));
export const Profile = lazy(() => import('../pages/Profile'));
export const OrderHistory = lazy(() => import('../pages/OrderHistory'));
export const AddressBook = lazy(() => import('../pages/AddressBook'));
export const OrderManagement = lazy(() => import('../pages/OrderManagement'));
export const VoucherManagement = lazy(() => import('../pages/VoucherManagement'));
export const Settings = lazy(() => import('../pages/Settings'));
export const ReviewManagement = lazy(() => import('../pages/ReviewManagement'));

// Map string name to component
const componentsMap = {
  Login,
  Register,
  VerifyEmail,
  Home,
  ProductDetail,
  Cart,
  Checkout,
  PaymentCallback,
  OrderSuccess,
  OrderDetail,
  OrderHistory,
  AddressBook,
  MockPayment,
  GoogleCallback,
  DashboardLayout, // Layout không lazy load
  DashboardContent,
  ProductManagement,
  CategoryManagement,
  UserManagement,
  VoucherManagement,
  NotFound,
  Profile,
  OrderManagement,
  Settings,
  ReviewManagement,
};

export default componentsMap;

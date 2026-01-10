import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Badge, Dropdown } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  LoginOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { fetchCart } from '../../redux/slices/cartSlice';
import './HomeNavbar.css';

const HomeNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get cart state from Redux
  // Get cart state from Redux
  const { totalQuantity: cartCount } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Check if user is logged in (sync with Redux)
  const isLoggedIn = isAuthenticated || !!localStorage.getItem('token');
  
  // Load cart when component mounts (if logged in)
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [isLoggedIn, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Dispatch logout action if available
    window.location.href = '/login'; 
  };
  
  const userMenuItems = [
    ...(user?.role === 'admin' ? [{
      key: 'dashboard',
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    }] : []),
    {
      key: 'profile',
      label: 'Hồ sơ',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'history',
      label: 'Lịch sử đơn hàng',
      onClick: () => navigate('/order-history'),
    },
    {
      key: 'addresses',
      label: 'Sổ địa chỉ',
      onClick: () => navigate('/addresses'),
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="home-navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">KY-7 Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop-menu">
            <Link to="/" className="nav-link">
              Trang chủ
            </Link>
            <a href="#products" className="nav-link">
              Sản phẩm
            </a>
            <a href="#categories" className="nav-link">
              Danh mục
            </a>
            <a href="#about" className="nav-link">
              Về chúng tôi
            </a>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Button
              type="text"
              icon={
                <Badge count={0} offset={[5, 0]}>
                  <HeartOutlined style={{ fontSize: '20px' }} />
                </Badge>
              }
              className="action-btn"
            />
            <Button
              type="text"
              icon={
                <Badge count={cartCount || 0} offset={[5, 0]}>
                  <ShoppingCartOutlined style={{ fontSize: '20px' }} />
                </Badge>
              }
              className="action-btn"
              onClick={() => navigate('/cart')}
            />
            
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  className="user-btn"
                >
                  Tài khoản
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                className="login-btn"
              >
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <a href="#products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Sản phẩm
            </a>
            <a href="#categories" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Danh mục
            </a>
            <a href="#about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Về chúng tôi
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;

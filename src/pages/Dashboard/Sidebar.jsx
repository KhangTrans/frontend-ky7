import { Layout, Menu, Avatar, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Text } = Typography;

function Sidebar({ collapsed, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Thể loại',
    },
    {
      key: '/dashboard/users',
      icon: <TeamOutlined />,
      label: 'Người dùng',
    },
    {
      key: '/dashboard/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn hàng',
    },
    {
      key: '/dashboard/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
    },
    {
      key: '/dashboard/documents',
      icon: <FileTextOutlined />,
      label: 'Tài liệu',
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsed={collapsed}
      width={200}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#001529',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {!collapsed ? (
          <Space>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#667eea' }}
            />
            <div>
              <Text strong style={{ color: '#fff', display: 'block', fontSize: 16 }}>
                {user?.fullName || 'Admin'}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 12 }}>
                {user?.role?.toUpperCase() || 'USER'}
              </Text>
            </div>
          </Space>
        ) : (
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ marginTop: 16 }}
      />
    </Sider>
  );
}

export default Sidebar;

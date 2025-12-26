import { useState } from 'react';
import { Layout, Button, Space, Tag, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import Sidebar from '../pages/Dashboard/Sidebar';
import NotificationBell from './NotificationBell';

const { Header, Content } = Layout;
const { Text } = Typography;

function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} user={user} />
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space size="middle" align="center">
            <NotificationBell />
            <Space size="small">
              <Text strong>{user.fullName}</Text>
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role.toUpperCase()}
              </Tag>
            </Space>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              loading={isLoading}
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;

import { Card, Avatar, Typography, Tag, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../../components/HomeNavbar';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!user) {
      // Basic protection, though route handles it
      return <div style={{padding: 50, textAlign: 'center'}}>Vui lòng đăng nhập</div>;
  }

  return (
    <div className="profile-page-container" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <HomeNavbar />
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
         <Card bordered={false} style={{ borderRadius: 10, overflow: 'hidden' }}>
            <div className="profile-header" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="profile-avatar-wrapper" style={{ marginBottom: 20 }}>
                    <Avatar 
                        size={120} 
                        src={user.avatar} 
                        icon={<UserOutlined />} 
                        style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                </div>
                
                <Title level={2} style={{ marginBottom: 5 }}>{user.username || 'Thành viên'}</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>{user.email}</Text>
                
                <div style={{ marginTop: 15 }}>
                    <Tag color="geekblue" style={{ padding: '4px 12px', borderRadius: 20 }}>
                        {user.role?.toUpperCase() || 'MEMBER'}
                    </Tag>
                </div>

                <div style={{ marginTop: 30 }}>
                    <Button type="primary" icon={<EditOutlined />} size="large">
                        Chỉnh sửa thông tin
                    </Button>
                </div>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Profile;

import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
        extra={[
          <Button 
            type="primary" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')} 
            key="home"
            size="large"
          >
            Về trang chủ
          </Button>,
          <Button 
            onClick={() => navigate(-1)} 
            key="back"
            size="large"
          >
            Quay lại
          </Button>,
        ]}
      />
    </div>
  );
}

export default NotFound;

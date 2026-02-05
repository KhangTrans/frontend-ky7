import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, Result, Spin, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosConfig';
import { setCredentials } from '../redux/slices/authSlice';
import './Login.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Đang xác thực email...');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link xác thực không hợp lệ (thiếu token).');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axiosInstance.post('/auth/verify-email', { token });
        
        // Success
        setStatus('success');
        setMessage('Xác thực email thành công! Đang chuyển hướng...');
        
        // Save auth data
        if (response.data?.data) {
          const { user, token: authToken } = response.data.data;
          
          if (user && authToken) {
            // Save to localStorage
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update Redux state
            dispatch(setCredentials({ user, token: authToken }));
          }
        }

        // Redirect after delay
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (error) {
        console.error('Verify email error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyEmail();
  }, [token, navigate, dispatch]);

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} />
            <h2 style={{ marginTop: 24, color: '#333' }}>Đang xác thực...</h2>
            <p style={{ color: '#666' }}>Vui lòng đợi trong giây lát.</p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <Result
          status="success"
          title="Xác thực thành công!"
          subTitle={message}
          extra={[
             <Button type="primary" key="home" onClick={() => navigate('/')}>
               Về Trang Chủ Ngay
             </Button>
          ]}
        />
      );
    }

    if (status === 'error') {
      return (
        <Result
          status="error"
          title="Xác thực thất bại"
          subTitle={message}
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              Quay lại Đăng nhập
            </Button>
          ]}
        />
      );
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-box" style={{ maxWidth: 500, width: '100%' }}>
            {renderContent()}
      </div>
    </div>
  );
}

export default VerifyEmail;

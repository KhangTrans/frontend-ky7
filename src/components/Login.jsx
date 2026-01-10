import { Form, Input, Button, Checkbox, Divider, notification } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { loginUser } from '../redux/slices/authSlice';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.auth);
  const isLoggingIn = useRef(false);

  useEffect(() => {
    // Chỉ tự động chuyển nếu không phải trong quá trình login
    if (isAuthenticated && !isLoggingIn.current) {
      // Phân quyền redirect dựa vào role
      if (user?.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values) => {
    try {
      isLoggingIn.current = true;
      
      const result = await dispatch(loginUser({
        email: values.email,
        password: values.password
      }));

      console.log('Login result:', result);

      if (loginUser.fulfilled.match(result)) {
        const successMessage = result.payload?.message || 'Đăng nhập thành công!';
        
        api.success({
          message: 'Thành công!',
          description: successMessage,
          placement: 'topRight',
          duration: 2,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          style: {
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
            border: '1px solid #b7eb8f',
          },
        });
        
        // Đợi notification hiện rồi mới chuyển trang
        setTimeout(() => {
          isLoggingIn.current = false;
          
          // Phân quyền redirect: admin vào dashboard, user vào home
          const userRole = result.payload?.user?.role;
          console.log('User role:', userRole);
          
          if (userRole === 'admin') {
            navigate('/dashboard', { replace: true });
          } else {
            // User hoặc các role khác về home
            navigate('/', { replace: true });
          }
        }, 2000);
      } else if (loginUser.rejected.match(result)) {
        isLoggingIn.current = false;
        // Xử lý khi đăng nhập thất bại - lấy message từ backend
        const errorMessage = result.payload || 'Thông tin đăng nhập không chính xác!';
        
        console.log('Login failed with:', errorMessage);
        
        api.error({
          message: 'Đăng nhập thất bại',
          description: errorMessage,
          placement: 'topRight',
          duration: 4,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          style: {
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
            border: '1px solid #ffccc7',
          },
        });
      }
    } catch (err) {
      isLoggingIn.current = false;
      console.error('Login error:', err);
      api.error({
        message: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại!',
        placement: 'topRight',
        duration: 4,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        style: {
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
          border: '1px solid #ffccc7',
        },
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    api.warning({
      message: 'Thông tin chưa hợp lệ',
      description: 'Vui lòng kiểm tra lại các trường thông tin!',
      placement: 'topRight',
      duration: 3,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      style: {
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(250, 173, 20, 0.15)',
        border: '1px solid #ffe58f',
      },
    });
  };

  return (
    <>
      {contextHolder}
      <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Đăng Nhập</h1>
        <p className="login-subtitle">Chào mừng bạn trở lại!</p>
        
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: '⚠️ Vui lòng nhập email!' },
              { type: 'email', message: '⚠️ Email không hợp lệ!' }
            ]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: '⚠️ Vui lòng nhập mật khẩu!' },
              { min: 6, message: '⚠️ Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div className="form-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a href="#" className="forgot-password">Quên mật khẩu?</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={isLoading}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Đăng ký ngay</a></p>
        </div>

        {/* <Divider plain>Hoặc đăng nhập với</Divider>

        <div className="social-login">
          <Button 
            icon={<GoogleOutlined />}
            size="large"
            className="social-button google"
          >
            Google
          </Button>
          <Button 
            icon={<FacebookOutlined />}
            size="large"
            className="social-button facebook"
          >
            Facebook
          </Button>
        </div> */}
      </div>
    </div>
    </>
  );
}

export default Login;

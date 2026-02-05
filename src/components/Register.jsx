import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import './Login.css'; // Sử dụng chung CSS với Login

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      
      const requestData = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName
      };

      console.log('Registering with:', requestData);

      // Gọi API đăng ký
      const response = await axiosInstance.post('/auth/register', requestData);

      console.log('Register response:', response.data);

      // Hiển thị thông báo thành công
      api.success({
        message: 'Đăng ký thành công!',
        description: 'Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.',
        placement: 'topRight',
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        style: {
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
          border: '1px solid #b7eb8f',
        },
      });

      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Register error:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Đăng ký thất bại. Vui lòng thử lại!';

      api.error({
        message: 'Đăng ký thất bại',
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
    } finally {
      setIsLoading(false);
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
          <h1 className="login-title">Đăng Ký</h1>
          <p className="login-subtitle">Tạo tài khoản mới</p>
          
          <Form
            form={form}
            name="register"
            initialValues={{
              username: 'newuser',
              email: 'newuser@example.com',
              password: 'password123',
              fullName: 'New User'
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: '⚠️ Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: '⚠️ Tên đăng nhập phải có ít nhất 3 ký tự!' }
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: '⚠️ Vui lòng nhập họ và tên!' },
                { min: 2, message: '⚠️ Họ và tên phải có ít nhất 2 ký tự!' }
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                size="large"
              />
            </Form.Item>

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
                prefix={<MailOutlined />}
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

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '⚠️ Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('⚠️ Mật khẩu không khớp!'));
                  },
                }),
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                loading={isLoading}
              >
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <p>Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập ngay</a></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

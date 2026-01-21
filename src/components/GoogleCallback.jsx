import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import axiosInstance from '../api/axiosConfig';
import { notification } from 'antd';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: 'Không tìm thấy token xác thực từ Google.',
            });
            navigate('/login');
            return;
        }

        const handleGoogleLogin = async () => {
            try {
                // 1. Lưu token tạm thời để axiosInstance tự động attach vào header
                localStorage.setItem('token', token);

                // 2. Gọi API lấy thông tin user
                const response = await axiosInstance.get('/auth/me');

                if (response.data.success) {
                    const user = response.data.data;
                    
                    // 3. Lưu thông tin user vào localStorage (giống authSlice)
                    localStorage.setItem('user', JSON.stringify(user));

                    // 4. Update Redux store
                    dispatch(setCredentials({ user, token }));

                    notification.success({
                        message: 'Đăng nhập thành công',
                        description: `Chào mừng ${user.name || user.email} quay trở lại!`,
                    });

                    // 5. Redirect dựa vào role
                    if (user.role === 'admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    throw new Error('Không thể lấy thông tin người dùng');
                }
            } catch (error) {
                console.error('Google login error:', error);
                
                // Rollback nếu lỗi
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                notification.error({
                    message: 'Đăng nhập thất bại',
                    description: error.message || 'Có lỗi xảy ra khi xử lý đăng nhập Google.',
                });
                navigate('/login');
            }
        };

        handleGoogleLogin();
    }, [searchParams, navigate, dispatch]);

    // UI loading đơn giản
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <h2>Đang xử lý đăng nhập Google...</h2>
            <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3', 
                borderTop: '4px solid #1890ff', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                marginTop: '16px'
            }}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GoogleCallback;

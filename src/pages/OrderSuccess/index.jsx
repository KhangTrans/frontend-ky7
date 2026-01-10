import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Result, Spin } from 'antd';
import { orderAPI } from '../../api'; // Import orderAPI
import HomeNavbar from '../../components/HomeNavbar';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState(location.state?.orderId || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu không có orderId trong state (do refresh), thử lấy đơn hàng mới nhất
    if (!orderId) {
       fetchLatestOrder();
    }
  }, []);

  const fetchLatestOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll(); // Giả sử getAll trả về list sorted by date desc
      if (res.success && res.data && res.data.length > 0) {
        // Lấy đơn hàng đầu tiên (mới nhất)
        // Cần đảm bảo backend sort desc, hoặc client tự sort
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrderId(sortedOrders[0]._id || sortedOrders[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch latest order', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = () => {
     if (orderId) {
        navigate(`/orders/${orderId}`);
     } else {
        navigate('/profile'); // Fallback cuối cùng nếu vẫn không tìm thấy
     }
  };

  return (
    <>
      <HomeNavbar />
      <div className="order-success-container">
        <div className="success-content">
          <Result
            status="success"
            title="Đặt hàng thành công!"
            subTitle="Cảm ơn bạn đã mua sắm tại KY-7 Shop. Đơn hàng của bạn đang được xử lý."
            extra={[
              <Button 
                type="primary" 
                key="console" 
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/')}
                size="large"
              >
                Tiếp tục mua sắm
              </Button>,
              <Button 
                key="buy" 
                icon={<FileTextOutlined />}
                onClick={handleViewOrder} 
                size="large"
                loading={loading}
              >
                Xem đơn hàng
              </Button>,
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;

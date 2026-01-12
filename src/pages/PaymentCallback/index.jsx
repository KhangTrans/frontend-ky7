import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Card } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import HomeNavbar from '../../components/HomeNavbar';
import axiosInstance from '../../api/axiosConfig';
import './PaymentCallback.css';

function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const path = location.pathname;
        let endpoint = '';
        
        // Xác định kết quả dựa trên URL Path (Backend redirect về đây)
        if (path.includes('/payment/success')) {
            setStatus('success');
            setMessage('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
            // Lấy orderId từ state nếu có (do redirect từ VNPay/ZaloPay qua)
            if (location.state?.orderId) {
                setOrderInfo({ orderId: location.state.orderId });
            }
        } else if (path.includes('/payment/failed')) {
            setStatus('error');
            const msgCode = params.get('message') || params.get('code') || 'Lỗi không xác định';
            setMessage(`Thanh toán thất bại (${msgCode}). Vui lòng thử lại.`);
        } 
        // Logic cũ cho VNPAY Return URL (nếu redirect trực tiếp về frontend)
        else if (path.includes('/vnpay')) {
            const vnp_ResponseCode = params.get('vnp_ResponseCode');
            const vnp_TxnRef = params.get('vnp_TxnRef');
            const vnp_OrderInfo = params.get('vnp_OrderInfo');
            
            if (vnp_ResponseCode === '00') {
                // Trích xuất OrderId thực (MongoDB ID) từ OrderInfo nếu có
                // Format: "Thanh toan don hang <OrderId>"
                let realOrderId = vnp_TxnRef;
                if (vnp_OrderInfo) {
                    const match = vnp_OrderInfo.match(/([a-f0-9]{24})/);
                    if (match && match[1]) {
                        realOrderId = match[1];
                    }
                }

                // Thay vì hiển thị luôn, chuyển hướng sang trang success cho đẹp URL
                navigate('/payment/success', { state: { orderId: realOrderId } });
                return;
            } else {
                setStatus('error');
                setMessage('Thanh toán VNPay thất bại hoặc bị hủy.');
            }
        } else if (path.includes('/zalopay')) {
            const statusParams = params.get('status');
            const apptransid = params.get('apptransid'); // ZaloPay thường trả về apptransid
             if (statusParams === '1') {
                navigate('/payment/success', { state: { orderId: apptransid } }); // Note: ZaloPay ID format might differ
                return;
            } else {
                setStatus('error');
                setMessage('Thanh toán ZaloPay thất bại.');
            }
        } else {
            const orderIdParam = params.get('orderId');
            if (orderIdParam) setOrderInfo({ orderId: orderIdParam });
            
            setStatus('error');
            setMessage('Đường dẫn không hợp lệ.');
        }

        // NOTE: Trong thực tế, bạn NÊN gọi API backend để verify tính toàn vẹn dữ liệu
        /*
        if (endpoint) {
             const response = await axiosInstance.get(endpoint);
             if (response.data.success) {
                 setStatus('success');
             } else {
                 setStatus('error');
             }
        }
        */

      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác minh thanh toán.');
      } finally {
        setLoading(false);
      }
    };

    // Giả lập delay một chút cho UX
    setTimeout(() => {
        verifyPayment();
    }, 1500);

  }, [location]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="callback-loading">
          <Spin size="large" tip={message} />
        </div>
      );
    }

    if (status === 'success') {
      return (
        <Result
          status="success"
          icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
          title="Thanh toán thành công!"
          subTitle={message}
          extra={[
            <Button 
                type="primary" 
                key="home" 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size="large"
            >
              Về trang chủ
            </Button>,
            <Button 
                key="history" 
                icon={<ShoppingOutlined />}
                onClick={() => {
                   // Check if ID is a valid MongoDB ObjectId (24 hex characters)
                   const isValidId = orderInfo?._id && /^[0-9a-fA-F]{24}$/.test(orderInfo._id);
                   if (isValidId) {
                       navigate(`/orders/${orderInfo._id}`);
                   } else {
                       navigate('/order-history');
                   }
                }} 
                size="large"
            >
              Xem đơn hàng
            </Button>,
          ]}
        />
      );
    }

    return (
      <Result
        status="error"
        icon={<CloseCircleFilled style={{ color: '#ff4d4f' }} />}
        title="Thanh toán thất bại"
        subTitle={message}
        extra={[
          <Button 
            type="primary" 
            key="retry"
            onClick={() => navigate('/checkout')} // Quay lại checkout để thử lại
            size="large"
          >
            Thử lại
          </Button>,
          <Button 
            key="home" 
            onClick={() => navigate('/')}
            size="large"
          >
            Về trang chủ
          </Button>,
        ]}
      />
    );
  };

  return (
        <>
            <HomeNavbar />
            <div className="payment-callback-container">
                <Card className="callback-card">
                    {renderContent()}
                </Card>
            </div>
        </>
  );
}

export default PaymentCallback;

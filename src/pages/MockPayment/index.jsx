import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider, Spin, message, Result } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, DollarCircleOutlined, BankOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') === 'zalopay' ? 'ZaloPay' : 'VNPay';
  
  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  useEffect(() => {
    // Giả lập loading kết nối
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = (status) => {
    setProcessing(true);
    message.loading('Đang xử lý giao dịch...', 1.5).then(() => {
        if (status === 'success') {
          message.success('Thanh toán thành công!');
          // Redirect to callback page to update order status via API or verify logic
          // Simulating: /payment/zalopay/return?status=1&apptransid=...
          navigate(`/payment/${method.toLowerCase()}/return?status=1&amount=${amount}&orderId=${orderId}`);
        } else {
          message.error('Thanh toán thất bại!');
           navigate(`/payment/${method.toLowerCase()}/return?status=0&orderId=${orderId}`);
        }
    });
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Đang kết nối tới cổng thanh toán {method}...</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f0f2f5', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20
    }}>
      <Card 
        style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        cover={
          <div style={{ 
            height: 60, 
            background: method === 'VNPay' ? 'linear-gradient(90deg, #005C97 0%, #363795 100%)' : '#0068ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}>
             Cổng thanh toán {method} (Sandbox)
          </div>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Text type="secondary">Đơn hàng</Text>
          <Title level={4} style={{ margin: '4px 0' }}>{orderId}</Title>
        </div>

        <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text>Số tiền thanh toán:</Text>
            <Text strong style={{ fontSize: 18, color: '#f5222d' }}>{formatPrice(amount)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Nội dung:</Text>
            <Text>Thanh toan don hang {orderId}</Text>
          </div>
        </div>

        <Divider>Chọn phương thức xác thực</Divider>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button 
            type="primary" 
            size="large" 
            block
            icon={<CheckCircleFilled />}
            style={{ 
                background: '#52c41a', 
                borderColor: '#52c41a', 
                height: 50,
                fontSize: 16
            }}
            loading={processing}
            onClick={() => handlePayment('success')}
          >
            Thanh toán thành công
          </Button>
          
          <Button 
            danger 
            size="large" 
            block
            icon={<CloseCircleFilled />}
            style={{ height: 50, fontSize: 16 }}
            disabled={processing}
            onClick={() => handlePayment('failed')}
          >
            Hủy giao dịch
          </Button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#aaa' }}>
          * Đây là trang giả lập vì Backend chưa kích hoạt API thanh toán thực tế.
        </div>
      </Card>
    </div>
  );
};

export default MockPayment;

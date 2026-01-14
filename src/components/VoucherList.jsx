import { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Row, Col, Typography, Empty, Tag, Tooltip } from 'antd';
import { CopyOutlined, GiftOutlined, CalendarOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosConfig';
import dayjs from 'dayjs';
import './VoucherList.css';

const { Title, Text, Paragraph } = Typography;

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]); // Store IDs of collected vouchers
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState({}); // Track loading state for each voucher
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isLoggedIn = isAuthenticated || !!localStorage.getItem('token');

  useEffect(() => {
    fetchVouchers();
    if (isLoggedIn) {
      fetchMyVouchers();
    }
  }, [isLoggedIn]);

  const fetchVouchers = async () => {
    try {
      const response = await axiosInstance.get('/vouchers/public');
      if (response.data.success) {
        setVouchers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVouchers = async () => {
    try {
      const response = await axiosInstance.get('/vouchers/my-vouchers');
      if (response.data.success) {
        // Assume API returns array of voucher objects or IDs. 
        // We'll store IDs for easy lookup.
        // Adjust based on actual API response structure.
        // If response.data.data is array of objects with voucherId inside or just voucher objects
        const collected = response.data.data.map(v => v._id || v.voucherId); 
        setMyVouchers(collected);
      }
    } catch (error) {
      console.error('Error fetching my vouchers:', error);
    }
  };

  const handleCollect = async (voucherId) => {
    if (!isLoggedIn) {
      message.warning('Vui lòng đăng nhập để lưu voucher!');
      return;
    }

    setCollecting(prev => ({ ...prev, [voucherId]: true }));
    try {
      const response = await axiosInstance.post(`/vouchers/collect/${voucherId}`);
      if (response.data.success) {
        message.success('Đã lưu voucher vào ví của bạn!');
        setMyVouchers(prev => [...prev, voucherId]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể lưu voucher');
    } finally {
      setCollecting(prev => ({ ...prev, [voucherId]: false }));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  if (loading) return null; 
  if (vouchers.length === 0) return null;

  return (
    <section className="voucher-section">
      <div className="container">
        <div className="voucher-header">
           <Title level={2} className="section-title">
              <GiftOutlined style={{ marginRight: 10, color: '#ff4d4f' }} />
              Ưu Đãi Độc Quyền
           </Title>
           <Text type="secondary">Săn ngay voucher giảm giá cực hot dành cho bạn!</Text>
        </div>
        
        <div className="voucher-grid">
          {vouchers.map((voucher) => {
            const isCollected = myVouchers.includes(voucher._id);
            return (
              <div key={voucher._id} className="voucher-ticket">
                 <div className="voucher-left">
                    <div className="voucher-value">
                       {voucher.type === 'DISCOUNT' ? (
                          <>
                             <span className="unit">Giảm</span>
                             <span className="number">{voucher.discountPercent}%</span>
                          </>
                       ) : (
                          <>
                             <span className="unit">Free</span>
                             <span className="number">Ship</span>
                          </>
                       )}
                    </div>
                    <div className="voucher-deco-circle top"></div>
                    <div className="voucher-deco-circle bottom"></div>
                 </div>
                 <div className="voucher-right">
                    <div className="voucher-info">
                       <h3 className="voucher-code" onClick={() => handleCopyCode(voucher.code)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {voucher.code}
                          <Tooltip title="Sao chép">
                            <CopyOutlined style={{ fontSize: 14, color: '#999' }} />
                          </Tooltip>
                       </h3>
                       <p className="voucher-desc">{voucher.description}</p>
                       <div className="voucher-meta">
                          <small>Đơn tối thiểu: {parseInt(voucher.minOrderAmount).toLocaleString()}đ</small> <br/>
                          <small className="expiry">
                             <CalendarOutlined /> HSD: {dayjs(voucher.endDate).format('DD/MM/YYYY')}
                          </small>
                       </div>
                    </div>
                    
                    {isCollected ? (
                       <Button 
                          type="default" 
                          icon={<CheckOutlined />} 
                          className="action-btn collected"
                          disabled
                       >
                          Đã Lấy
                       </Button>
                    ) : (
                       <Button 
                          type="primary" 
                          icon={<SaveOutlined />} 
                          className="action-btn collect"
                          loading={collecting[voucher._id]}
                          onClick={() => handleCollect(voucher._id)}
                       >
                          Lưu
                       </Button>
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VoucherList;

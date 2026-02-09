import { useState, useEffect } from 'react';
import { Tag, Button, message, Tooltip } from 'antd';
import { GiftOutlined, CopyOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosConfig';
import dayjs from 'dayjs';
import './ProductVouchers.css';

const ProductVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState({});
  
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
        // Hiển thị tất cả voucher
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

  if (loading || vouchers.length === 0) return null;

  return (
    <div className="product-vouchers-section">
      <div className="vouchers-header">
        <GiftOutlined className="header-icon" />
        <span className="header-title">Mã giảm giá</span>
      </div>
      
      <div className="vouchers-list">
        {vouchers.map((voucher) => {
          const isCollected = myVouchers.includes(voucher._id);
          return (
            <div key={voucher._id} className="voucher-compact-card">
              <div className="voucher-compact-left">
                {voucher.type === 'DISCOUNT' ? (
                  <div className="discount-value">
                    <span className="discount-number">{voucher.discountPercent}%</span>
                    <span className="discount-label">Giảm</span>
                  </div>
                ) : (
                  <div className="discount-value">
                    <span className="discount-label">Free</span>
                    <span className="discount-number">Ship</span>
                  </div>
                )}
              </div>
              
              <div className="voucher-compact-right">
                <div className="voucher-compact-info">
                  <div className="voucher-code-row">
                    <span className="voucher-code-text">{voucher.code}</span>
                    <Tooltip title="Sao chép">
                      <CopyOutlined 
                        className="copy-icon" 
                        onClick={() => handleCopyCode(voucher.code)}
                      />
                    </Tooltip>
                  </div>
                  <p className="voucher-compact-desc">{voucher.description}</p>
                  <div className="voucher-compact-meta">
                    <span className="min-order">Đơn tối thiểu: {parseInt(voucher.minOrderAmount).toLocaleString()}đ</span>
                    <span className="expiry-date">HSD: {dayjs(voucher.endDate).format('DD/MM/YYYY')}</span>
                  </div>
                </div>
                
                {isCollected ? (
                  <Button 
                    size="small"
                    icon={<CheckOutlined />}
                    className="voucher-btn collected"
                    disabled
                  >
                    Đã lưu
                  </Button>
                ) : (
                  <Button 
                    size="small"
                    type="primary"
                    icon={<SaveOutlined />}
                    className="voucher-btn collect"
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
  );
};

export default ProductVouchers;

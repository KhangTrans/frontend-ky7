import { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Row, Col, Typography, Empty, Tag } from 'antd';
import { CopyOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosConfig';
import dayjs from 'dayjs';
import './VoucherList.css';

const { Title, Text, Paragraph } = Typography;

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  if (loading) return null; // Or skeleton
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
          {vouchers.map((voucher) => (
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
                     <h3 className="voucher-code">{voucher.code}</h3>
                     <p className="voucher-desc">{voucher.description}</p>
                     <div className="voucher-meta">
                        <small>Đơn tối thiểu: {parseInt(voucher.minOrderAmount).toLocaleString()}đ</small> <br/>
                        <small className="expiry">
                           <CalendarOutlined /> HSD: {dayjs(voucher.endDate).format('DD/MM/YYYY')}
                        </small>
                     </div>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />} 
                    className="copy-btn"
                    onClick={() => handleCopyCode(voucher.code)}
                  >
                     Sao chép
                  </Button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VoucherList;

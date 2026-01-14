import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';

const VoucherStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
    byType: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/vouchers/admin/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch voucher stats:', error);
        // Silent fail or low priority message to not annoy user on dashboard
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic
              title="Tổng số Voucher"
              value={stats.total}
              prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic
              title="Đã hết hạn/Vô hiệu"
              value={stats.expired}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Statistic
              title="Lượt sử dụng"
              value={stats.totalUsage}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoucherStatistics;

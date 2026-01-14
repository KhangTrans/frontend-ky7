import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  // Data for Charts
  const typeData = stats.byType?.map(item => ({
    name: item.type === 'DISCOUNT' ? 'Giảm giá' : 'Freeship',
    value: item.count
  })) || [];

  const statusData = [
    { name: 'Đang hoạt động', value: stats.active, color: '#3f8600' },
    { name: 'Đã hết hạn/Vô hiệu', value: stats.expired, color: '#cf1322' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Cards Section */}
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

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Status Distribution */}
        <Col xs={24} md={12}>
          <Card title="Trạng thái Voucher" bordered={false} style={{ height: 400 }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
             </ResponsiveContainer>
          </Card>
        </Col>
        
        {/* Type Distribution */}
        <Col xs={24} md={12}>
          <Card title="Phân loại Voucher" bordered={false} style={{ height: 400 }}>
            {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={typeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false}/>
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng" fill="#8884d8" barSize={50}>
                        {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <span>Chưa có dữ liệu</span>
                </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoucherStatistics;

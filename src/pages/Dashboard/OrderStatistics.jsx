import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { orderAPI } from '../../api';

const { Text } = Typography;

const COLORS = {
  pending: '#faad14',   // Orange
  confirmed: '#1890ff', // Blue
  processing: '#13c2c2',// Cyan
  shipping: '#722ed1',  // Purple
  delivered: '#52c41a', // Green
  cancelled: '#ff4d4f'  // Red
};

const STATUS_LABELS = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
};

const OrderStatistics = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await orderAPI.getStatistics();
        if (statsRes.success) {
          setStats(statsRes.data);
        }

        // Fetch recent orders (limit 5)
        const ordersRes = await orderAPI.getAdminOrders({ limit: 5, page: 1 });
        if (ordersRes.success) {
          setRecentOrders(ordersRes.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const barData = stats ? Object.keys(stats.ordersByStatus).map(status => ({
    name: STATUS_LABELS[status] || status,
    value: stats.ordersByStatus[status],
    color: COLORS[status] || '#8884d8'
  })) : [];

  const pieData = barData.filter(item => item.value > 0);

  if (loading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
              <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
      );
  }

  return (
    <>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="Tổng doanh thu"
              value={stats?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              precision={0}
              formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="Tổng đơn hàng"
              value={stats?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="Đang chờ xử lý"
              value={stats?.ordersByStatus?.pending || 0}
              prefix={<SyncOutlined spin={stats?.ordersByStatus?.pending > 0} />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="Đơn đã thành công"
              value={stats?.ordersByStatus?.delivered || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Thống kê đơn hàng theo trạng thái" bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ height: 350, width: '100%' }}>
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip 
                        formatter={(value) => [`${value} đơn`, 'Số lượng']}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
               </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
            <Card title="Tỷ trọng đơn hàng" bordered={false} style={{ borderRadius: 8, height: '100%' }}>
                <div style={{ height: 350, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend layout="vertical" align="center" verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
           <Card title="Đơn hàng gần đây" bordered={false} style={{ borderRadius: 8 }}>
                <Table 
                    dataSource={recentOrders} 
                    rowKey="_id" 
                    pagination={false}
                    size="small"
                    scroll={{ x: 600 }}
                    columns={[
                        {
                            title: 'Mã đơn',
                            dataIndex: 'orderNumber',
                            render: text => <Text strong>{text}</Text>
                        },
                        {
                            title: 'Khách hàng',
                            dataIndex: 'customerName',
                        },
                        {
                            title: 'Tổng tiền',
                            dataIndex: 'total',
                            render: val => <Text type="success" strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</Text>
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'orderStatus',
                            align: 'center',
                            render: status => {
                                const color = COLORS[status] || 'default';
                                return <Tag color={color}>{STATUS_LABELS[status] || status.toUpperCase()}</Tag>
                            }
                        },
                        {
                            title: 'Ngày tạo',
                            dataIndex: 'createdAt',
                            render: date => new Date(date).toLocaleString('vi-VN')
                        }
                    ]}
                />
           </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderStatistics;

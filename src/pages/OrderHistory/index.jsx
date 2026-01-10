import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderAPI } from '../../api';
import HomeNavbar from '../../components/HomeNavbar';
import './OrderHistory.css';

const { Title } = Typography;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => <a onClick={() => navigate(`/orders/${record._id || record.id}`)}>{text || record._id}</a>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (text) => `${(text || 0).toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => {
        let color = 'default';
        let text = status;
        const s = status?.toLowerCase();
        
        if (s === 'pending') { color = 'orange'; text = 'Chờ xử lý'; }
        else if (s === 'processing') { color = 'blue'; text = 'Đang xử lý'; }
        else if (s === 'shipping') { color = 'cyan'; text = 'Đang giao'; }
        else if (s === 'completed') { color = 'success'; text = 'Hoàn thành'; }
        else if (s === 'cancelled') { color = 'error'; text = 'Đã hủy'; }
        
        return <Tag color={color}>{text?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => navigate(`/orders/${record._id || record.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="order-history-page">
      <HomeNavbar />
      <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card title={<Title level={3}>Lịch sử đơn hàng</Title>} bordered={false}>
          <Table 
            columns={columns} 
            dataSource={orders} 
            rowKey="_id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default OrderHistory;

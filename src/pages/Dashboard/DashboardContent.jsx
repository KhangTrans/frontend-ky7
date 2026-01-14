import React from 'react';
import { Space, Typography, Tabs } from 'antd';
import OrderStatistics from './OrderStatistics';
import VoucherStatistics from './VoucherStatistics';

const { Title, Text } = Typography;

function DashboardContent({ user }) {
  const items = [
    {
      key: 'orders',
      label: 'Thống kê Đơn hàng',
      children: <OrderStatistics />,
    },
    {
      key: 'vouchers',
      label: 'Thống kê Voucher',
      children: <VoucherStatistics />,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ marginBottom: 0 }}>
          Xin chào, {user?.fullName || user?.username || 'Admin'}! 👋
        </Title>
        <Text type="secondary">
          Đây là tổng quan tình hình kinh doanh của bạn hôm nay.
        </Text>
      </div>

      <Tabs defaultActiveKey="orders" items={items} />
    </Space>
  );
}

export default DashboardContent;

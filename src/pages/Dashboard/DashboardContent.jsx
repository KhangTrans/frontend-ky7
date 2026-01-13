import React from 'react';
import { Space, Typography } from 'antd';
import OrderStatistics from './OrderStatistics';

const { Title, Text } = Typography;

function DashboardContent({ user }) {
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

      <OrderStatistics />
      
      {/* Trong tương lai có thể thêm:
          <ProductStatistics />
          <UserStatistics /> 
      */}
    </Space>
  );
}

export default DashboardContent;

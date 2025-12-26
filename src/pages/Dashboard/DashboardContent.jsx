import { Card, Row, Col, Statistic, Space, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

function DashboardContent({ user }) {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={1} style={{ marginBottom: 8 }}>
          Chào mừng {user?.fullName || user?.username || 'Người dùng'}!
        </Title>
        <Text type="secondary">
          Email: {user?.email || 'N/A'} | Username: {user?.username || 'N/A'}
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Tổng người dùng"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Đơn hàng"
              value={893}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Doanh thu"
              value={58932}
              prefix={<DollarOutlined />}
              suffix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Tăng trưởng"
              value={11.28}
              precision={2}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ thống kê" bordered={false}>
            <div
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: 8,
                fontSize: 24,
              }}
            >
              <Text>📊 Biểu đồ sẽ được hiển thị ở đây</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Hoạt động gần đây" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#f9f9f9',
                  borderRadius: 8,
                }}
              >
                <UserOutlined style={{ fontSize: 24 }} />
                <div>
                  <Text>
                    <Text strong>Người dùng mới</Text> đã đăng ký
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    2 phút trước
                  </Text>
                </div>
              </Space>
              <Space
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#f9f9f9',
                  borderRadius: 8,
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
                <div>
                  <Text>
                    <Text strong>Đơn hàng #1234</Text> đã được tạo
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    15 phút trước
                  </Text>
                </div>
              </Space>
              <Space
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#f9f9f9',
                  borderRadius: 8,
                }}
              >
                <DollarOutlined style={{ fontSize: 24 }} />
                <div>
                  <Text>
                    <Text strong>Thanh toán</Text> đã được xác nhận
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    1 giờ trước
                  </Text>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default DashboardContent;

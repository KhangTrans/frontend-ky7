import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Row, 
  Col, 
  Card,
  Divider,
  Space,
  Table,
  Tag,
  Switch,
  Popconfirm,
  Image,
  ColorPicker,
  Typography,
  Tooltip
} from 'antd';
import { 
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import BannerFormModal from './BannerFormModal';

const { Text } = Typography;

const AppearanceSettings = ({ 
  data, 
  onUpdateAppearance, 
  onCreateBanner, 
  onUpdateBanner, 
  onDeleteBanner 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  
  // Banner Modal State
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerModalLoading, setBannerModalLoading] = useState(false);

  useEffect(() => {
    if (data) {
      const newPrimaryColor = data.primaryColor || '#1890ff';
      form.setFieldsValue({
        footerText: data.footerText || '',
      });
      // Schedule state update after form update
      requestAnimationFrame(() => {
        setPrimaryColor(newPrimaryColor);
      });
    }
  }, [data, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    const colorValue = typeof primaryColor === 'string' 
      ? primaryColor 
      : primaryColor.toHexString();

    const appearanceData = {
      primaryColor: colorValue,
      footerText: values.footerText,
    };

    await onUpdateAppearance(appearanceData);
    setLoading(false);
  };

  // Banner handlers
  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerModalVisible(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerModalVisible(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    await onDeleteBanner(bannerId);
  };

  const handleBannerSubmit = async (bannerData) => {
    setBannerModalLoading(true);
    
    let success;
    if (editingBanner) {
      success = await onUpdateBanner(editingBanner._id, bannerData);
    } else {
      success = await onCreateBanner(bannerData);
    }
    
    setBannerModalLoading(false);
    
    if (success) {
      setBannerModalVisible(false);
      setEditingBanner(null);
    }
  };

  const handleBannerModalCancel = () => {
    setBannerModalVisible(false);
    setEditingBanner(null);
  };

  // Banner table columns
  const bannerColumns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url) => (
        <Image
          src={url}
          alt="Banner"
          width={100}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      ),
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
      render: (link) => link ? (
        <Tooltip title={link}>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <EyeOutlined /> Xem
          </a>
        </Tooltip>
      ) : '-',
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
      render: (order) => <Tag>{order || 0}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hiển thị' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditBanner(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa banner này?"
            onConfirm={() => handleDeleteBanner(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="appearance-settings">
      {/* General Appearance Settings */}
      <Card title="Cấu hình chung" className="settings-section-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Màu chủ đạo"
              >
                <div className="color-picker-container">
                  <ColorPicker 
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    showText
                    size="large"
                  />
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    Màu này sẽ được áp dụng cho các nút và liên kết
                  </Text>
                </div>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="color-preview" style={{ 
                marginTop: 30,
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>
                <Button 
                  type="primary" 
                  style={{ 
                    backgroundColor: typeof primaryColor === 'string' 
                      ? primaryColor 
                      : primaryColor?.toHexString?.() || '#1890ff'
                  }}
                >
                  Nút mẫu
                </Button>
                <span style={{ 
                  color: typeof primaryColor === 'string' 
                    ? primaryColor 
                    : primaryColor?.toHexString?.() || '#1890ff',
                  fontWeight: 500
                }}>
                  Liên kết mẫu
                </span>
              </div>
            </Col>
          </Row>

          <Form.Item
            name="footerText"
            label="Nội dung Footer"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="© 2026 Tên cửa hàng. Tất cả quyền được bảo lưu."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu cấu hình
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* Banner Management */}
      <Card 
        title="Quản lý Banner"
        className="settings-section-card"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddBanner}
          >
            Thêm Banner
          </Button>
        }
      >
        <Table
          columns={bannerColumns}
          dataSource={data?.banners || []}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'Chưa có banner nào' }}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Banner Form Modal */}
      <BannerFormModal
        visible={bannerModalVisible}
        onCancel={handleBannerModalCancel}
        onSubmit={handleBannerSubmit}
        loading={bannerModalLoading}
        initialValues={editingBanner}
      />
    </div>
  );
};

export default AppearanceSettings;

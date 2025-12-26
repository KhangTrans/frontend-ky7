import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Switch,
  Upload,
  message,
  Button,
  Space,
  Image,
  Card,
  Tag,
  Typography,
} from 'antd';
import {
  PictureOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import RichTextEditor from '../../components/RichTextEditor';
import { uploadImage, deleteImage } from '../../utils/imageUpload';

const { Text } = Typography;

// Hàm chuyển đổi tên thành slug
const convertToSlug = (text) => {
  if (!text) return '';
  
  // Chuyển đổi ký tự tiếng Việt có dấu thành không dấu
  const from = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  
  for (let i = 0; i < from.length; i++) {
    text = text.replace(new RegExp(from[i], 'gi'), to[i]);
  }
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Loại bỏ nhiều dấu gạch ngang liên tiếp
};

// Component riêng để preview ảnh, tránh re-render toàn bộ form
const PreviewImage = ({ form }) => {
  const imageUrl = Form.useWatch('imageUrl', form);
  
  if (!imageUrl) return null;
  
  return (
    <Form.Item label="Xem trước">
      <img
        src={imageUrl}
        alt="Preview"
        style={{
          width: '100%',
          maxWidth: 300,
          height: 200,
          objectFit: 'cover',
          borderRadius: 8,
          border: '1px solid #d9d9d9',
        }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
        }}
      />
    </Form.Item>
  );
};

const CategoryFormModal = ({ 
  visible, 
  mode = 'add', // 'view', 'add', 'edit'
  onCancel, 
  onSubmit, 
  onEdit,
  form, 
  editingCategory,
  viewingCategory, 
  loading 
}) => {
  const [uploading, setUploading] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  const category = viewingCategory || editingCategory;

  const getTitle = () => {
    if (isViewMode) return 'Chi tiết thể loại';
    if (isEditMode) return 'Sửa thể loại';
    return 'Thêm thể loại mới';
  };

  const getFooter = () => {
    if (isViewMode) {
      return [
        <Button 
          key="edit" 
          type="primary" 
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          Chỉnh sửa
        </Button>,
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ];
    }
    return undefined; // Default footer (OK + Cancel)
  };

  const handleImageUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return Upload.LIST_IGNORE;
    }

    // Validate file size (max 4MB cho Vercel)
    const isLt4M = file.size / 1024 / 1024 < 4;
    if (!isLt4M) {
      message.error('Ảnh phải nhỏ hơn 4MB (giới hạn Vercel)!');
      return Upload.LIST_IGNORE;
    }

    setUploading(true);
    const result = await uploadImage(file, 'categories');
    setUploading(false);
    
    if (result) {
      form.setFieldsValue({ 
        imageUrl: result.url,
        publicId: result.publicId 
      });
    }

    return false; // Prevent default upload behavior
  };

  const handleDeleteImage = async () => {
    const currentPublicId = form.getFieldValue('publicId');
    if (!currentPublicId) {
      message.warning('Không có ảnh để xóa!');
      return;
    }

    const success = await deleteImage(currentPublicId);
    if (success) {
      form.setFieldsValue({ imageUrl: '', publicId: '' });
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onOk={isViewMode ? onCancel : onSubmit}
      onCancel={onCancel}
      okText={isEditMode ? 'Cập nhật' : 'Thêm'}
      cancelText={isViewMode ? undefined : "Hủy"}
      width={700}
      confirmLoading={loading}
      destroyOnClose
      forceRender
      footer={getFooter()}
      style={{ top: 20 }}
    >
      {isViewMode ? (
        // View mode - Hiển thị readonly
        <div style={{ padding: '16px 0' }}>
          {/* Ảnh */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Image
                src={category?.imageUrl}
                alt={category?.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 12,
                  border: '2px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                fallback="https://via.placeholder.com/300x200"
              />
            </Col>
          </Row>

          {/* Thông tin chi tiết */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small" style={{ background: '#fafafa' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ color: '#666' }}>Tên thể loại:</Text>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff', marginTop: 4 }}>
                      {category?.name}
                    </div>
                  </div>
                  
                  <div>
                    <Text strong style={{ color: '#666' }}>Slug:</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue" style={{ fontSize: 14 }}>{category?.slug}</Tag>
                    </div>
                  </div>

                  <div>
                    <Text strong style={{ color: '#666' }}>Mô tả:</Text>
                    <div 
                      style={{ marginTop: 4, color: '#333' }}
                      dangerouslySetInnerHTML={{ __html: category?.description }}
                    />
                  </div>

                  <div>
                    <Text strong style={{ color: '#666' }}>Trạng thái:</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag 
                        color={category?.isActive ? 'success' : 'error'}
                        style={{ fontSize: 14, padding: '4px 12px', borderRadius: 12 }}
                      >
                        {category?.isActive ? '✓ Kích hoạt' : '✗ Vô hiệu hóa'}
                      </Tag>
                    </div>
                  </div>

                  {category?.createdAt && (
                    <div>
                      <Text strong style={{ color: '#666' }}>
                        <CalendarOutlined /> Ngày tạo:
                      </Text>
                      <div style={{ marginTop: 4, color: '#666' }}>
                        {new Date(category.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}

                  {category?.updatedAt && (
                    <div>
                      <Text strong style={{ color: '#666' }}>
                        <CalendarOutlined /> Cập nhật:
                      </Text>
                      <div style={{ marginTop: 4, color: '#666' }}>
                        {new Date(category.updatedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        // Add/Edit mode - Form
        <Form form={form} layout="vertical" name="categoryForm">
          {/* Tên thể loại */}
        <Form.Item
          name="name"
          label="Tên thể loại"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thể loại!' },
            { min: 2, message: 'Tên thể loại phải có ít nhất 2 ký tự!' },
          ]}
        >
          <Input 
            placeholder="Nhập tên thể loại (VD: Điện thoại, Laptop)" 
            onChange={(e) => {
              const slug = convertToSlug(e.target.value);
              form.setFieldsValue({ slug });
            }}
          />
        </Form.Item>

        {/* Slug */}
        <Form.Item
          name="slug"
          label="Slug (URL thân thiện)"
          rules={[
            { required: true, message: 'Slug là bắt buộc!' },
            { 
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
              message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang!' 
            },
          ]}
          extra="Slug tự động tạo từ tên thể loại"
        >
          <Input placeholder="Tự động tạo từ tên..." disabled />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <RichTextEditor 
            placeholder="Nhập mô tả chi tiết về thể loại..."
          />
        </Form.Item>

        {/* Ảnh */}
        <Form.Item
          name="imageUrl"
          label="Ảnh thể loại"
          rules={[{ required: true, message: 'Vui lòng tải ảnh lên hoặc nhập URL!' }]}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Input 
                placeholder="https://res.cloudinary.com/... hoặc upload ảnh" 
                prefix={<PictureOutlined />}
                disabled={uploading}
              />
            </Col>
            <Col span={8}>
              <Space.Compact style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  disabled={uploading}
                >
                  <Button
                    icon={uploading ? <LoadingOutlined /> : <PictureOutlined />}
                    loading={uploading}
                    style={{ width: '100%' }}
                  >
                    {uploading ? 'Đang tải...' : 'Upload'}
                  </Button>
                </Upload>
                {form.getFieldValue('publicId') && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteImage}
                    title="Xóa ảnh khỏi Cloudinary"
                  />
                )}
              </Space.Compact>
            </Col>
          </Row>
        </Form.Item>

        {/* Hidden field for publicId */}
        <Form.Item name="publicId" hidden>
          <Input />
        </Form.Item>

        {/* Preview ảnh */}
        <PreviewImage form={form} />

        {/* Trạng thái */}
        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch 
            checkedChildren="Kích hoạt" 
            unCheckedChildren="Vô hiệu hóa" 
          />
        </Form.Item>
      </Form>
      )}
    </Modal>
  );
};

export default CategoryFormModal;

import { useEffect, useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  Upload, 
  Button,
  Row,
  Col,
  Image
} from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadImage } from '../../utils/imageUpload';

const BannerFormModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading, 
  initialValues 
}) => {
  const [form] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const newImageUrl = initialValues.imageUrl || '';
        form.setFieldsValue({
          link: initialValues.link || '',
          order: initialValues.order || 0,
          isActive: initialValues.isActive !== false,
        });
        // Schedule state update after form update
        requestAnimationFrame(() => {
          setImageUrl(newImageUrl);
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          order: 0,
          isActive: true,
        });
        requestAnimationFrame(() => {
          setImageUrl('');
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleImageUpload = async (file) => {
    setUploadLoading(true);
    const result = await uploadImage(file, 'banners');
    if (result?.url) {
      setImageUrl(result.url);
    }
    setUploadLoading(false);
    return false; // Prevent default upload behavior
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!imageUrl) {
        form.setFields([
          {
            name: 'image',
            errors: ['Vui lòng tải lên ảnh banner!'],
          },
        ]);
        return;
      }

      const bannerData = {
        ...values,
        imageUrl,
      };

      onSubmit(bannerData);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText={initialValues ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          order: 0,
          isActive: true,
        }}
      >
        <Form.Item
          name="image"
          label="Ảnh Banner"
          required
        >
          <div className="banner-upload-container">
            {imageUrl ? (
              <div className="banner-preview">
                <Image
                  src={imageUrl}
                  alt="Banner preview"
                  width="100%"
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  <Button 
                    icon={uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
                    loading={uploadLoading}
                    style={{ marginTop: 8 }}
                  >
                    Thay đổi ảnh
                  </Button>
                </Upload>
              </div>
            ) : (
              <Upload.Dragger
                showUploadList={false}
                beforeUpload={handleImageUpload}
                accept="image/*"
                style={{ padding: '20px 0' }}
              >
                {uploadLoading ? (
                  <div>
                    <LoadingOutlined style={{ fontSize: 32 }} />
                    <p style={{ marginTop: 8 }}>Đang tải lên...</p>
                  </div>
                ) : (
                  <div>
                    <UploadOutlined style={{ fontSize: 32 }} />
                    <p style={{ marginTop: 8 }}>Click hoặc kéo thả ảnh vào đây</p>
                    <p style={{ color: '#999', fontSize: 12 }}>
                      Kích thước khuyến nghị: 1920 x 600px
                    </p>
                  </div>
                )}
              </Upload.Dragger>
            )}
          </div>
        </Form.Item>



        <Form.Item
          name="link"
          label="Liên kết (URL)"
          rules={[
            { 
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                // Chấp nhận path nội bộ (/product/...) hoặc URL đầy đủ
                if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Vui lòng nhập path (vd: /product/abc) hoặc URL đầy đủ!'));
              }
            }
          ]}
        >
          <Input placeholder="/product/abc123 hoặc https://..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="order"
              label="Thứ tự hiển thị"
              tooltip="Số nhỏ hơn sẽ hiển thị trước"
            >
              <InputNumber 
                min={0} 
                max={99} 
                style={{ width: '100%' }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Hiển thị" 
                unCheckedChildren="Ẩn" 
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default BannerFormModal;

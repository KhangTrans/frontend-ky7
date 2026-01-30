import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Row, 
  Col, 
  Upload, 
  Card,
  Divider,
  Space,
  Avatar
} from 'antd';
import { 
  UploadOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { uploadImage } from '../../utils/imageUpload';

const { TextArea } = Input;

const StoreSettings = ({ data, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (data) {
      // Use startTransition to batch state updates
      const newLogoUrl = data.logo || '';
      form.setFieldsValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
        facebook: data.socialLinks?.facebook || '',
        zalo: data.socialLinks?.zalo || '',
        instagram: data.socialLinks?.instagram || '',
      });
      // Schedule state update after form update
      requestAnimationFrame(() => {
        setLogoUrl(newLogoUrl);
      });
    }
  }, [data, form]);

  const handleLogoUpload = async (file) => {
    setUploadLoading(true);
    const result = await uploadImage(file, 'store');
    if (result?.url) {
      setLogoUrl(result.url);
    }
    setUploadLoading(false);
    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    const storeData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      description: values.description,
      logo: logoUrl,
      socialLinks: {
        facebook: values.facebook || '',
        zalo: values.zalo || '',
        instagram: values.instagram || '',
      }
    };

    await onUpdate(storeData);
    setLoading(false);
  };

  return (
    <div className="store-settings">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="store-settings-form"
      >
        <Card title="Thông tin cơ bản" className="settings-section-card">
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item label="Logo cửa hàng">
                <div className="logo-upload-container">
                  <Avatar
                    size={120}
                    src={logoUrl}
                    icon={uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
                    className="store-logo-preview"
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleLogoUpload}
                    accept="image/*"
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={uploadLoading}
                      style={{ marginTop: 12 }}
                    >
                      Tải lên
                    </Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={18}>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="name"
                    label="Tên cửa hàng"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên cửa hàng!' },
                      { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                    ]}
                  >
                    <Input placeholder="Nhập tên cửa hàng" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="email@example.com" 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="0123456789" 
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="Nhập địa chỉ cửa hàng" 
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả về cửa hàng của bạn..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Card>

        <Card title="Mạng xã hội" className="settings-section-card" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="facebook"
                label="Facebook"
              >
                <Input 
                  prefix={<FacebookOutlined style={{ color: '#1877F2' }} />} 
                  placeholder="https://facebook.com/..." 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="zalo"
                label="Zalo"
              >
                <Input 
                  prefix={<span style={{ fontWeight: 'bold', color: '#0068FF' }}>Z</span>} 
                  placeholder="https://zalo.me/..." 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="instagram"
                label="Instagram"
              >
                <Input 
                  prefix={<InstagramOutlined style={{ color: '#E4405F' }} />} 
                  placeholder="https://instagram.com/..." 
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Form.Item className="form-actions">
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StoreSettings;

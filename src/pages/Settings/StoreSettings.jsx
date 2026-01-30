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
  Avatar,
  Select
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
import { useProvinces } from '../../hooks/useProvinces';

const { TextArea } = Input;

const StoreSettings = ({ data, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  
  // Hook cho tỉnh/huyện/xã
  const { 
    provinces, 
    districts, 
    wards, 
    loading: addressLoading, 
    fetchDistricts, 
    fetchWards 
  } = useProvinces();

  // State để lưu selected values
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    if (data) {
      // Use startTransition to batch state updates
      const newLogoUrl = data.logo || '';
      
      // Address là string đơn giản, hiển thị trong field addressDetail
      form.setFieldsValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        province: undefined,
        district: undefined,
        ward: undefined,
        addressDetail: data.address || '',
        description: data.description || '',
        facebook: data.socialLinks?.facebook || '',
        zalo: data.socialLinks?.zalo || '',
        instagram: data.socialLinks?.instagram || '',
      });
      
      // Schedule state updates after render to avoid cascading renders
      requestAnimationFrame(() => {
        setLogoUrl(newLogoUrl);
        // Reset selected province/district vì address là string
        setSelectedProvince(null);
        setSelectedDistrict(null);
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

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (value, option) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    form.setFieldsValue({ 
      district: undefined, 
      ward: undefined,
      province: option?.label 
    });
    fetchDistricts(value);
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (value, option) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ 
      ward: undefined,
      district: option?.label 
    });
    fetchWards(value);
  };

  // Xử lý khi chọn phường/xã
  const handleWardChange = (value, option) => {
    form.setFieldsValue({ ward: option?.label });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Gộp địa chỉ thành 1 chuỗi: "Địa chỉ chi tiết, Phường/Xã, Quận/Huyện, Tỉnh/TP"
    const addressParts = [
      values.addressDetail,
      values.ward,
      values.district,
      values.province
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    
    const storeData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: fullAddress,
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
          
          {/* Địa chỉ - Tỉnh/Huyện/Xã */}
          <Divider orientation="left" style={{ marginTop: 8 }}>
            <EnvironmentOutlined /> Địa chỉ cửa hàng
          </Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
              >
                <Select
                  showSearch
                  placeholder="Chọn tỉnh/thành phố"
                  loading={addressLoading.provinces}
                  onChange={handleProvinceChange}
                  optionFilterProp="label"
                  options={provinces.map(p => ({ 
                    value: p.code, 
                    label: p.name 
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
              >
                <Select
                  showSearch
                  placeholder="Chọn quận/huyện"
                  loading={addressLoading.districts}
                  onChange={handleDistrictChange}
                  optionFilterProp="label"
                  options={districts.map(d => ({ 
                    value: d.code, 
                    label: d.name 
                  }))}
                  disabled={!selectedProvince}
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="ward"
                label="Phường/Xã"
              >
                <Select
                  showSearch
                  placeholder="Chọn phường/xã"
                  loading={addressLoading.wards}
                  onChange={handleWardChange}
                  optionFilterProp="label"
                  options={wards.map(w => ({ 
                    value: w.code, 
                    label: w.name 
                  }))}
                  disabled={!selectedDistrict}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="addressDetail"
            label="Địa chỉ chi tiết"
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="Số nhà, tên đường, tòa nhà..." 
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

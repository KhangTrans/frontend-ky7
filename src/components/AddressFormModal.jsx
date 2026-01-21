import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Select } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const AddressFormModal = ({ visible, onCancel, onSuccess, form }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State lưu ID để gọi API cấp con
  const [provinceId, setProvinceId] = useState(null);
  const [districtId, setDistrictId] = useState(null);

  // Fetch Provinces on mount
  useEffect(() => {
    if (visible) {
      fetchProvinces();
    }
  }, [visible]);

  const fetchProvinces = async () => {
    try {
      const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
      if (response.data.error === 0) {
        setProvinces(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (provId) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provId}.htm`);
      if (response.data.error === 0) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (distId) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${distId}.htm`);
      if (response.data.error === 0) {
        setWards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const handleProvinceChange = (value, option) => {
    // value là tên (do ta gán value={item.full_name} bên dưới) hoặc id tùy cách impl
    // Để tiện lưu vào DB string, ta để value là Tên.
    // Lấy ID từ option key hoặc data attribute
    
    // Reset fields
    form.setFieldsValue({ district: undefined, ward: undefined });
    setDistricts([]);
    setWards([]);
    setDistrictId(null);

    // Call API next level
    const selectedId = option.key; 
    setProvinceId(selectedId);
    fetchDistricts(selectedId);
  };

  const handleDistrictChange = (value, option) => {
    form.setFieldsValue({ ward: undefined });
    setWards([]);
    
    const selectedId = option.key;
    setDistrictId(selectedId);
    fetchWards(selectedId);
  };

  return (
    <Modal
        title="Thêm địa chỉ mới"
        open={visible}
        onOk={() => form.submit()}
        onCancel={onCancel}
        okText="Hoàn thành"
        cancelText="Trở lại"
        destroyOnClose
    >
        <Form form={form} layout="vertical" onFinish={onSuccess}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT!' }, { pattern: /^[0-9]{10}$/, message: 'SĐT sai định dạng!' }]}>
                        <Input placeholder="09xxx" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                     <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true, message: 'Chọn Tỉnh/Thành' }]}>
                        <Select 
                            placeholder="Chọn Tỉnh" 
                            onChange={handleProvinceChange}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {provinces.map(prov => (
                                <Option key={prov.id} value={prov.full_name}>{prov.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Chọn Quận/Huyện' }]}>
                        <Select 
                            placeholder="Chọn Quận" 
                            onChange={handleDistrictChange}
                            disabled={!provinceId}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {districts.map(dist => (
                                <Option key={dist.id} value={dist.full_name}>{dist.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Chọn Phường/Xã' }]}>
                         <Select 
                            placeholder="Chọn Phường" 
                            disabled={!districtId}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {wards.map(ward => (
                                <Option key={ward.id} value={ward.full_name}>{ward.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
                <TextArea rows={2} placeholder="Số nhà, tên đường..." />
            </Form.Item>
        </Form>
    </Modal>
  );
};

export default AddressFormModal;

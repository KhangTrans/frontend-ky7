import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Row, Col, Select, Divider, Button, Space, message } from 'antd';
import axios from 'axios';
import { addressAPI } from '../api';

const { TextArea } = Input;
const { Option } = Select;

const EditOrderInfoModal = ({ visible, onCancel, onSuccess, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);

    const [provinceId, setProvinceId] = useState(null);
    const [districtId, setDistrictId] = useState(null);

    // Initial Fetch (Provinces & Saved Addresses)
    useEffect(() => {
        if (visible) {
            fetchProvinces();
            fetchSavedAddresses();
        }
    }, [visible]);

    // Initialize Form with initialValues when modal opens or provinces load
    useEffect(() => {
        if (visible && provinces.length > 0 && initialValues) {
            // Only fill if form is not dirty? Or always reset to initial?
            // For now, always reset to initialValues on open
            fillFormWithAddress(initialValues);
        }
    }, [visible, provinces, initialValues]);

    const fetchSavedAddresses = async () => {
        try {
            const res = await addressAPI.getAll();
            if (res.success) setSavedAddresses(res.data);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        }
    };

    const fillFormWithAddress = (addr) => {
        if (!addr) return;
        
        form.setFieldsValue({
            customerName: addr.customerName || addr.fullName,
            customerPhone: addr.customerPhone || addr.phoneNumber,
            shippingNote: addr.shippingNote || '',
            address: addr.address,
            city: addr.city,
            district: addr.district,
            ward: addr.ward
        });

        // Trigger cascade logic
        if (addr.city && provinces.length > 0) {
            const foundProv = provinces.find(p => p.full_name === addr.city);
            if (foundProv) {
                setProvinceId(foundProv.id);
                fetchDistricts(foundProv.id);
                // We can't automatically set districtId here because we need to wait for districts fetch
                // But we can store the "target district" in a ref or temp state, OR rely on a separate Effect.
                // However, a simpler way is to let the user manual re-select if they change things, 
                // OR use a "pending" state.
                // Let's rely on the secondary effects below.
            }
        }
    };

    // React to District/Ward changes when "Autofill" happens is tricky because of async.
    // Enhanced Logic: When Districts Load, check if current form value matches any district, then set ID.
    useEffect(() => {
        const currentDistrict = form.getFieldValue('district');
        if (districts.length > 0 && currentDistrict) {
             const foundDist = districts.find(d => d.full_name === currentDistrict);
             if (foundDist) {
                 setDistrictId(foundDist.id);
                 fetchWards(foundDist.id);
             }
        }
    }, [districts]); // removed form dependency to avoid loops

    // Not strictly needed for Wards as it's the leaf node, but good for completeness if we had 4th level
    useEffect(() => {
        // no-op
    }, [wards]);

    const handleSelectAddress = (value) => {
        const selected = savedAddresses.find(a => a._id === value);
        if (selected) {
            fillFormWithAddress(selected);
            message.success('Đã chọn địa chỉ!');
        }
    };


    const fetchProvinces = async () => {
        try {
            const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            if (response.data.error === 0) setProvinces(response.data.data);
        } catch (error) { console.error('Error fetching provinces:', error); }
    };

    const fetchDistricts = async (provId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provId}.htm`);
            if (response.data.error === 0) setDistricts(response.data.data);
        } catch (error) { console.error('Error fetching districts:', error); }
    };

    const fetchWards = async (distId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${distId}.htm`);
            if (response.data.error === 0) setWards(response.data.data);
        } catch (error) { console.error('Error fetching wards:', error); }
    };

    const handleProvinceChange = (value, option) => {
        form.setFieldsValue({ district: undefined, ward: undefined });
        setDistricts([]);
        setWards([]);
        setDistrictId(null);
        setProvinceId(option.key);
        fetchDistricts(option.key);
    };

    const handleDistrictChange = (value, option) => {
        form.setFieldsValue({ ward: undefined });
        setWards([]);
        setDistrictId(option.key);
        fetchWards(option.key);
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin giao hàng"
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            okText="Lưu thay đổi"
            cancelText="Hủy bỏ"
            confirmLoading={loading}
            destroyOnClose
        >
        <Form form={form} layout="vertical" onFinish={onSuccess}>
                {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <Form.Item label="Chọn từ sổ địa chỉ">
                            <Select 
                                placeholder="Chọn địa chỉ có sẵn..." 
                                onChange={handleSelectAddress}
                                allowClear
                            >
                                {savedAddresses.map(addr => (
                                    <Option key={addr._id} value={addr._id}>
                                        {addr.fullName} - {addr.phoneNumber} ({addr.address})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Divider dashed />
                    </div>
                )}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="customerName" label="Tên người nhận" rules={[{ required: true, message: 'Nhập tên!' }]}>
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT!' }, { pattern: /^[0-9]{10}$/, message: 'SĐT sai định dạng!' }]}>
                            <Input placeholder="09xxx" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true, message: 'Chọn Tỉnh!' }]}>
                            <Select 
                                placeholder="Tỉnh/Thành"
                                onChange={handleProvinceChange}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {provinces.map(p => <Option key={p.id} value={p.full_name}>{p.full_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Chọn Quận!' }]}>
                            <Select 
                                placeholder="Quận/Huyện"
                                onChange={handleDistrictChange}
                                disabled={!provinceId && !initialValues?.city} // Disable if no province selected
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {districts.map(d => <Option key={d.id} value={d.full_name}>{d.full_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                         <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Chọn Phường!' }]}>
                            <Select 
                                placeholder="Phường/Xã"
                                disabled={!districtId && !initialValues?.district}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {wards.map(w => <Option key={w.id} value={w.full_name}>{w.full_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
                    <TextArea rows={2} placeholder="Số nhà, tên đường..." />
                </Form.Item>
                <Form.Item name="shippingNote" label="Ghi chú giao hàng">
                    <TextArea rows={2} placeholder="Ví dụ: Gọi trước khi giao, giao giờ hành chính..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditOrderInfoModal;

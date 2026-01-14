import React from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { addressAPI } from '../../api';

const { TextArea } = Input;

const AddressFormModal = ({ visible, onCancel, onSuccess, form }) => {
  const handleAddNewAddress = async (values) => {
    try {
      const newAddrData = {
        ...values,
        // Assuming default handling is done by parent or API, usually first one is default if list empty.
        // Or we can let backend handle it. Here we just pass data.
      };
      // We can call API here, but parent might want control.
      // Instructions say "tách modal thêm địa chỉ ra file riêng".
      // Previous logic was in Checkout.jsx: handleAddNewAddress.
      // It checked userAddresses.length to set isDefault.
      // We should probably pass that logic or `isFirstAddress` prop if needed.
      // But typically, simply passing `onFinish` prop to handle submission in parent is cleaner for state management.
      // However, to make it self-contained if requested, we can do API call here if we knew context.
      // Let's stick to UI component first, or a smart component that calls onSuccess.
      
      // Let's pass the responsibility to parent via onSuccess (which will be `handleAddNewAddress` in parent).
      onSuccess(values); // This will call parent's handler
    } catch (error) {
       // Error handled in parent
    }
  };

  return (
    <Modal
        title="Thêm địa chỉ mới"
        open={visible}
        onOk={() => form.submit()}
        onCancel={onCancel}
        okText="Hoàn thành"
        cancelText="Trở lại"
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
                     <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true }]}>
                        <Input placeholder="TP.HCM" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                        <Input placeholder="Quận 1" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                        <Input placeholder="Bến Nghé" />
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

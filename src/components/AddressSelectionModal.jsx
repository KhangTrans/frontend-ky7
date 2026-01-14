import React from 'react';
import { Modal, Button, Radio, List, Tag, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './AddressSelectionModal.css'; // Will create this or reuse logic

const AddressSelectionModal = ({ 
    visible, 
    onCancel, 
    onOk, 
    addresses, 
    selectedId, 
    onChange, 
    onDelete, 
    onAddNew 
}) => {
  return (
    <Modal
        title="Địa chỉ của tôi"
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        width={600}
        okText="Xác nhận"
        cancelText="Hủy"
    >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Radio.Group onChange={(e) => onChange(e.target.value)} value={selectedId} style={{width: '100%'}}>
            <List
                itemLayout="horizontal"
                dataSource={addresses}
                renderItem={(item) => (
                    <div className={`address-item ${item._id === selectedId ? 'selected' : ''}`}>
                        <Radio value={item._id} style={{alignSelf: 'flex-start', marginTop: 4}} />
                        <div className="address-content">
                            <div className="address-header">
                                <span className="address-name">{item.fullName}</span>
                                <span className="address-phone">{item.phoneNumber}</span>
                                {item.isDefault && <Tag color="red">Mặc định</Tag>}
                            </div>
                            <span className="address-text">{item.address}</span>
                            <span className="address-text">{item.ward}, {item.district}, {item.city}</span>
                            
                            {!item.isDefault && (
                                <div className="address-actions">
                                    <Popconfirm
                                        title="Xóa địa chỉ này?"
                                        onConfirm={() => onDelete(item._id, item.isDefault)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button type="link" danger size="small" className="delete-address-btn">Xóa</Button>
                                    </Popconfirm>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />
            </Radio.Group>
            
            <Button 
                type="dashed" 
                block 
                icon={<PlusOutlined />} 
                onClick={onAddNew}
                className="add-new-address-btn"
                size="large"
            >
                Thêm địa chỉ mới
            </Button>
        </div>
    </Modal>
  );
};

export default AddressSelectionModal;

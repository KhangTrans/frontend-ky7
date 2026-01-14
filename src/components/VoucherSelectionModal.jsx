import React from 'react';
import { Modal, List, Tag, Button, Empty, Typography } from 'antd';
import { TagOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './VoucherSelectionModal.css';

const { Text } = Typography;

const VoucherSelectionModal = ({ 
    visible, 
    onCancel, 
    onSelect, 
    vouchers = [], 
    orderTotal = 0 
}) => {
    return (
        <Modal
            title="Chọn Voucher Voucher"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={500}
            className="voucher-selection-modal"
        >
            <div className="voucher-list-container">
               {vouchers.length === 0 ? (
                   <Empty description="Bạn chưa có voucher nào. Hãy sưu tầm thêm nhé!" />
               ) : (
                   <List
                        dataSource={vouchers}
                        renderItem={item => {
                            // Backend might return populated voucher object or just data. 
                            // Assuming structure usually is { ...voucherData } or { voucherId: { ... } }
                            // Let's assume normalized voucher object passed in.
                            const voucher = item.voucherId || item; 
                            
                            const isValid = orderTotal >= voucher.minOrderAmount;
                            const isExpired = dayjs().isAfter(dayjs(voucher.endDate));
                            const disabled = !isValid || isExpired;

                            return (
                                <div 
                                    className={`voucher-select-item ${disabled ? 'disabled' : ''}`}
                                    onClick={() => !disabled && onSelect(voucher)}
                                >
                                    <div className="voucher-left-part">
                                         <div className="voucher-icon-box">
                                             <TagOutlined style={{ fontSize: 20, color: '#fff' }} />
                                         </div>
                                    </div>
                                    <div className="voucher-right-part">
                                         <div className="voucher-row-top">
                                             <Text strong className="voucher-code-text">{voucher.code}</Text>
                                             {voucher.type === 'DISCOUNT' && <Tag color="green">Giảm {voucher.discountPercent}%</Tag>}
                                             {voucher.type === 'FREE_SHIP' && <Tag color="blue">Free Ship</Tag>}
                                         </div>
                                         <div className="voucher-description">{voucher.description}</div>
                                         <div className="voucher-conditions">
                                             Đơn tối thiểu: {parseInt(voucher.minOrderAmount).toLocaleString()}đ
                                         </div>
                                         <div className="voucher-expiry">
                                             <CalendarOutlined /> HSD: {dayjs(voucher.endDate).format('DD/MM/YYYY')}
                                         </div>
                                         
                                         {disabled && (
                                            <div className="voucher-reason">
                                                {isExpired ? 'Đã hết hạn' : `Cần đơn tối thiểu ${parseInt(voucher.minOrderAmount).toLocaleString()}đ`}
                                            </div>
                                         )}
                                    </div>
                                    <div className="voucher-radio">
                                         <div className={`radio-circle ${!disabled ? 'active' : ''}`}></div>
                                    </div>
                                </div>
                            );
                        }}
                   />
               )}
            </div>
        </Modal>
    );
};

export default VoucherSelectionModal;

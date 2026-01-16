import React from 'react';
import { Modal, List, Tag, Button, Empty, Typography } from 'antd';
import { TagOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './VoucherSelectionModal.css';

const { Text } = Typography;

const VoucherSelectionModal = ({ 
    visible, 
    onCancel, 
    onApply,
    selectedVouchers = [], // List of currently applied vouchers
    vouchers = [], 
    orderTotal = 0 
}) => {
    // Local state for selection within modal before confirming
    const [tempSelected, setTempSelected] = React.useState([]);

    React.useEffect(() => {
        if (visible) {
             // Initialize with currently active vouchers
            setTempSelected(selectedVouchers);
        }
    }, [visible, selectedVouchers]);

    const handleVoucherClick = (voucher) => {
        const isSelected = tempSelected.some(v => v._id === voucher._id);
        
        if (isSelected) {
            // Deselect
            setTempSelected(prev => prev.filter(v => v._id !== voucher._id));
        } else {
            // Select: Replace existing voucher of same type
            setTempSelected(prev => {
                const others = prev.filter(v => v.type !== voucher.type);
                return [...others, voucher];
            });
        }
    };

    const handleConfirm = () => {
        onApply(tempSelected);
    };

    return (
        <Modal
            title="Chọn Khuyến Mãi"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>Đóng</Button>,
                <Button key="apply" type="primary" onClick={handleConfirm}>Áp dụng</Button>
            ]}
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
                            
                            const isSelected = tempSelected.some(v => v._id === voucher._id);

                            return (
                                <div 
                                    className={`voucher-select-item ${disabled ? 'disabled' : ''} ${isSelected ? 'selected-item' : ''}`}
                                    onClick={() => !disabled && handleVoucherClick(voucher)}
                                    style={{ 
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        border: isSelected ? '1px solid #1890ff' : '1px solid #e8e8e8',
                                        backgroundColor: isSelected ? '#e6f7ff' : '#fff'
                                    }}
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
                                         <div className={`radio-circle ${isSelected ? 'active' : ''}`}></div>
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

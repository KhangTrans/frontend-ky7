import React, { useState } from 'react';
import { Modal, Radio, Input, Button, message, Space } from 'antd';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { orderAPI } from '../api';
import './CancelOrderModal.css';

const { TextArea } = Input;

const CANCEL_REASONS = [
  'Thay đổi ý định mua hàng',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Địa chỉ nhận hàng sai/không chính xác',
  'Đặt nhầm sản phẩm/số lượng',
  'Thời gian giao hàng quá lâu',
  'Khác'
];

const CancelOrderModal = ({ visible, onCancel, onSuccess, orderId }) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancelOrder = async () => {
    const finalReason = reason === 'Khác' ? customReason : reason;
    
    if (reason === 'Khác' && !customReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    setLoading(true);
    try {
      const response = await orderAPI.cancel(orderId, finalReason);
      if (response.success) {
        message.success('Đã hủy đơn hàng thành công');
        onSuccess(orderId);
        onCancel();
      } else {
        message.error(response.message || 'Hủy đơn hàng thất bại');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      message.error('Lỗi khi hủy đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="modal-title-container">
          <AlertTriangle color="#ff4d4f" size={24} />
          <span>Xác nhận hủy đơn hàng</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Quay lại
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          danger 
          loading={loading} 
          onClick={handleCancelOrder}
          icon={<Trash2 size={16} />}
        >
          Xác nhận hủy đơn
        </Button>
      ]}
      className="cancel-order-modal"
    >
      <div className="cancel-modal-content">
        <p className="warning-text">
          Lưu ý: Bạn chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái chờ xử lý hoặc chưa bắt đầu giao.
        </p>
        
        <label className="reason-label">Lý do hủy đơn hàng (Vui lòng chọn):</label>
        
        <Radio.Group 
          onChange={(e) => setReason(e.target.value)} 
          value={reason} 
          className="reason-radio-group"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {CANCEL_REASONS.map((r) => (
              <Radio key={r} value={r}>
                {r}
              </Radio>
            ))}
          </Space>
        </Radio.Group>

        {reason === 'Khác' && (
          <TextArea
            rows={3}
            placeholder="Hãy cho chúng tôi biết lý do của bạn..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            style={{ marginTop: '12px' }}
          />
        )}
      </div>
    </Modal>
  );
};

export default CancelOrderModal;

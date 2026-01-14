import { Modal, Descriptions, Tag, Spin } from 'antd';
import dayjs from 'dayjs';

const VoucherDetailModal = ({ visible, onCancel, voucher, loading }) => {
  if (!voucher && !loading) return null;

  return (
    <Modal
      title="Chi tiết Voucher"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã Voucher">
            <Tag color="blue" style={{ fontSize: '14px' }}>{voucher?.code}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Loại">
            <Tag color={voucher?.type === 'DISCOUNT' ? 'green' : 'cyan'}>
              {voucher?.type === 'DISCOUNT' ? 'Giảm giá' : 'Miễn phí vận chuyển'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Mô tả">
            {voucher?.description || 'Không có mô tả'}
          </Descriptions.Item>

          {voucher?.type === 'DISCOUNT' && (
            <Descriptions.Item label="Mức giảm">
              {voucher?.discountPercent}% (Tối đa: {voucher?.maxDiscount?.toLocaleString('vi-VN')}đ)
            </Descriptions.Item>
          )}

          {voucher?.type === 'FREE_SHIP' && (
            <Descriptions.Item label="Giảm tối đa phí ship">
              {voucher?.maxDiscount?.toLocaleString('vi-VN')}đ
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Đơn tối thiểu">
            {voucher?.minOrderAmount?.toLocaleString('vi-VN')}đ
          </Descriptions.Item>

          <Descriptions.Item label="Lượt sử dụng">
            {voucher?.usedCount} / {voucher?.usageLimit || 'Vô hạn'}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian áp dụng">
            <div>Từ: {dayjs(voucher?.startDate).format('DD/MM/YYYY HH:mm')}</div>
            <div>Đến: {dayjs(voucher?.endDate).format('DD/MM/YYYY HH:mm')}</div>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={voucher?.isActive ? 'success' : 'error'}>
              {voucher?.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày tạo">
            {dayjs(voucher?.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Cập nhật cuối">
             {dayjs(voucher?.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default VoucherDetailModal;

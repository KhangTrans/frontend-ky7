import React from 'react';
import { Modal, Button, Descriptions, Tag, Divider, List, Avatar, Row, Col } from 'antd';

const OrderDetailModal = ({ open, onClose, order }) => {
    if (!order) return null;

    return (
        <Modal
            title={`Chi tiết đơn hàng: ${order.orderNumber}`}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            ]}
            width={800}
        >
            <div>
                <Descriptions title="Thông tin chung" bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Ngày đặt">{new Date(order.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={order.orderStatus === 'paid' ? 'green' : 'orange'}>
                            {order.orderStatus ? order.orderStatus.toUpperCase() : 'UNKNOWN'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ tên">{order.customerName}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{order.customerPhone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.customerEmail || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng">
                        {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingCity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                        {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">
                        <Tag color={order.paymentStatus === 'paid' ? 'green' : 'red'}>
                            {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
                
                <Divider orientation="left">Sản phẩm</Divider>
                
                <List
                    itemLayout="horizontal"
                    dataSource={order.items || []}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.productImage || item.productId?.images?.[0]?.imageUrl} shape="square" size={64} />}
                                title={item.productName || item.productId?.name}
                                description={
                                    <div>
                                        <div>Số lượng: x{item.quantity}</div>
                                        <div style={{ color: '#d48806', fontWeight: 'bold' }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                        </div>
                                    </div>
                                }
                            />
                            <div style={{ fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                            </div>
                        </List.Item>
                    )}
                />

                <Divider />
                
                <div style={{ textAlign: 'right' }}>
                    <Row>
                        <Col span={18} style={{ fontWeight: 'bold' }}>Tạm tính:</Col>
                        <Col span={6}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.subtotal)}</Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                        <Col span={18} style={{ fontWeight: 'bold' }}>Phí vận chuyển:</Col>
                        <Col span={6}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shippingFee)}</Col>
                    </Row>
                    {order.discount > 0 && (
                        <Row style={{ marginTop: 8 }}>
                            <Col span={18} style={{ fontWeight: 'bold' }}>Giảm giá:</Col>
                            <Col span={6}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount)}</Col>
                        </Row>
                    )}
                    <Row style={{ marginTop: 16, fontSize: 18, color: '#d48806' }}>
                        <Col span={18} style={{ fontWeight: 'bold' }}>Tổng cộng:</Col>
                        <Col span={6} style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</Col>
                    </Row>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;

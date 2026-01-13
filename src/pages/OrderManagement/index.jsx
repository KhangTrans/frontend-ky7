import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, message, Card } from 'antd';
import { orderAPI } from '../../api';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const navigate = useNavigate();

    const fetchOrders = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const res = await orderAPI.getAdminOrders({ page, limit });
            if (res.success) {
                setOrders(res.data);
                setPagination({
                    current: res.pagination.page,
                    pageSize: res.pagination.limit,
                    total: res.pagination.total
                });
            }
        } catch (error) {
            console.error(error);
            message.error('Không thể tải danh sách đơn hàng: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total),
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Tag>{record.paymentMethod ? record.paymentMethod.toUpperCase() : 'N/A'}</Tag>
                    <Tag color={record.paymentStatus === 'paid' ? 'green' : 'orange'}>
                        {record.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status) => {
                let color = 'default';
                if (status === 'pending') color = 'orange';
                if (status === 'processing') color = 'blue';
                if (status === 'shipped') color = 'cyan';
                if (status === 'delivered') color = 'green';
                if (status === 'cancelled') color = 'red';
                return <Tag color={color}>{status ? status.toUpperCase() : 'UNKNOWN'}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => navigate(`/orders/${record._id}`)}>Chi tiết</Button>
                </Space>
            ),
        },
    ];

    const handleTableChange = (newPagination) => {
        fetchOrders(newPagination.current, newPagination.pageSize);
    };

    return (
        <Card title="Quản lý đơn hàng" style={{ margin: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} đơn hàng`
                }}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />
        </Card>
    );
};

export default OrderManagement;

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, message, Card, Input, Select, Row, Col } from 'antd';
import { orderAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

    const navigate = useNavigate();

    const fetchOrders = async (page = 1, limit = 10, search = searchText, status = statusFilter, payment = paymentMethodFilter) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search,
                status,
                paymentMethod: payment
            };

            // Remove empty keys
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const res = await orderAPI.getAdminOrders(params);
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
        // Initial load
        fetchOrders();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        fetchOrders(1, pagination.pageSize, value, statusFilter, paymentMethodFilter);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        fetchOrders(1, pagination.pageSize, searchText, value, paymentMethodFilter);
    };

    const handlePaymentChange = (value) => {
        setPaymentMethodFilter(value);
        fetchOrders(1, pagination.pageSize, searchText, statusFilter, value);
    };

    const handleReset = () => {
        setSearchText('');
        setStatusFilter('');
        setPaymentMethodFilter('');
        fetchOrders(1, pagination.pageSize, '', '', '');
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.customerPhone}</div>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => <span style={{ color: '#d48806', fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>,
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Tag color="cyan">{record.paymentMethod ? record.paymentMethod.toUpperCase() : 'N/A'}</Tag>
                    <Tag color={record.paymentStatus === 'paid' ? 'success' : 'warning'}>
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
                let label = 'Unknown';
                
                switch(status) {
                    case 'pending': color = 'orange'; label = 'Chờ xử lý'; break;
                    case 'processing': color = 'blue'; label = 'Đang xử lý'; break;
                    case 'shipped': color = 'cyan'; label = 'Đang giao'; break;
                    case 'delivered': color = 'green'; label = 'Đã giao'; break;
                    case 'cancelled': color = 'red'; label = 'Đã hủy'; break;
                    default: label = status;
                }
                
                return <Tag color={color}>{label}</Tag>;
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
                    <Button type="primary" size="small" ghost onClick={() => navigate(`/orders/${record._id}`)}>Chi tiết</Button>
                </Space>
            ),
        },
    ];

    const handleTableChange = (newPagination) => {
        fetchOrders(newPagination.current, newPagination.pageSize, searchText, statusFilter, paymentMethodFilter);
    };

    return (
        <Card title="Quản lý đơn hàng" style={{ margin: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: 20 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Search
                            placeholder="Tìm mã đơn hàng, tên khách..."
                            onSearch={handleSearch}
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            enterButton
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Trạng thái đơn hàng"
                            style={{ width: '100%' }}
                            onChange={handleStatusChange}
                            value={statusFilter || undefined}
                            allowClear
                        >
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="processing">Đang xử lý</Option>
                            <Option value="shipped">Đang giao hàng</Option>
                            <Option value="delivered">Đã giao hàng</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Phương thức thanh toán"
                            style={{ width: '100%' }}
                            onChange={handlePaymentChange}
                            value={paymentMethodFilter || undefined}
                            allowClear
                        >
                            <Option value="cod">COD</Option>
                            <Option value="vnpay">VNPay</Option>
                            <Option value="zalopay">ZaloPay</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4} lg={4}>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </div>

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

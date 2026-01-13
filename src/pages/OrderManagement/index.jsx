import React, { useEffect, useState, useCallback } from 'react';
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

    // Use a single param object to fetch orders, defaulting to current state if not provided
    const fetchOrders = useCallback(async (paramsObj = {}) => {
        setLoading(true);
        try {
            // Merge params: Priority passed params > state > default
            const page = paramsObj.page || pagination.current;
            const limit = paramsObj.limit || pagination.pageSize;
            
            // For filters, we check if they are explicitly passed (including empty string to clear), 
            // otherwise use current state. Using 'undefined' check allows passing empty string to clear.
            const search = paramsObj.search !== undefined ? paramsObj.search : searchText;
            const status = paramsObj.status !== undefined ? paramsObj.status : statusFilter;
            const paymentMethod = paramsObj.paymentMethod !== undefined ? paramsObj.paymentMethod : paymentMethodFilter;

            const apiParams = {
                page,
                limit,
                search,
                status,
                paymentMethod
            };

            // Remove empty keys to verify null/undefined/empty string
            Object.keys(apiParams).forEach(key => {
                if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined) {
                    delete apiParams[key];
                }
            });
            
            console.log('Fetching orders with params:', apiParams);

            const res = await orderAPI.getAdminOrders(apiParams);
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
    }, [pagination.current, pagination.pageSize, searchText, statusFilter, paymentMethodFilter]);

    // Initial load
    useEffect(() => {
        // We only want to run this once on mount, or when pagination changes (handled by Table onChange usually)
        // But since we have filters, we need to be careful.
        // Let's call it manually from effects when meaningful changes happen or just once on mount
        fetchOrders({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSearch = (value) => {
        setSearchText(value);
        // Reset to page 1 when searching
        fetchOrders({ page: 1, search: value });
    };

    const handleStatusChange = (value) => {
        const newVal = value || ''; 
        setStatusFilter(newVal);
        fetchOrders({ page: 1, status: newVal });
    };

    const handlePaymentChange = (value) => {
        const newVal = value || '';
        setPaymentMethodFilter(newVal);
        fetchOrders({ page: 1, paymentMethod: newVal });
    };

    const handleReset = () => {
        setSearchText('');
        setStatusFilter('');
        setPaymentMethodFilter('');
        fetchOrders({ 
            page: 1, 
            search: '', 
            status: '', 
            paymentMethod: '' 
        });
    };

    const handleTableChange = (newPagination) => {
        // Table pagination change. Keep current filters.
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
        fetchOrders({ 
            page: newPagination.current, 
            limit: newPagination.pageSize 
        });
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
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
            width: 120,
            render: (total) => <span style={{ color: '#d48806', fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>,
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            width: 150,
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Tag color="geekblue">{record.paymentMethod ? record.paymentMethod.toUpperCase() : 'N/A'}</Tag>
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
            width: 120,
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
            width: 150,
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" size="small" ghost onClick={() => navigate(`/orders/${record._id}`)}>Chi tiết</Button>
                </Space>
            ),
        },
    ];

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

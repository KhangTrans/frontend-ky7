import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Space, Button, message, Card, Input, Select, Row, Col, Statistic, Tooltip, Modal } from 'antd';
import { orderAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, ReloadOutlined, ShoppingCartOutlined, DollarCircleOutlined, SyncOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import OrderDetailModal from './OrderDetailModal';

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

    // Update Status State
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Detail Modal State
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [detailOrder, setDetailOrder] = useState(null);

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

            // Remove empty keys
            Object.keys(apiParams).forEach(key => {
                if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined) {
                    delete apiParams[key];
                }
            });
            
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

    // Stats State
    const [stats, setStats] = useState({
        totalOrders: 0,
        ordersByStatus: {
            pending: 0,
            processing: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0
        },
        totalRevenue: 0
    });

    const fetchStats = async () => {
        try {
            const res = await orderAPI.getStatistics();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchOrders({ page: 1 });
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSearch = (value) => {
        setSearchText(value);
        fetchOrders({ page: 1, search: value });
    };

    const handleStatusChangeFilter = (value) => {
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
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
        fetchOrders({ 
            page: newPagination.current, 
            limit: newPagination.pageSize 
        });
    };

    // Update Status Logic
    const openUpdateStatusModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setIsStatusModalVisible(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;

        setUpdatingStatus(true);
        try {
            const res = await orderAPI.updateStatus(selectedOrder._id, { orderStatus: newStatus });
            if (res.success || res.message) {
                 message.success('Cập nhật trạng thái thành công');
                 setIsStatusModalVisible(false);
                 fetchOrders(); // Reload list
                 fetchStats(); // Reload stats
            } else {
                message.error('Cập nhật thất bại');
            }
        } catch (error) {
            console.error(error);
            message.error('Lỗi cập nhật: ' + (error.message || 'Unknown error'));
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Detail Modal Logic
    const openDetailModal = async (order) => {
        setIsDetailModalVisible(true);
        try {
            const res = await orderAPI.getById(order._id);
            if (res.success) {
                setDetailOrder(res.data);
            } else {
                // Fallback to table data if API fails, though unlikely
                 setDetailOrder(order);
            }
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            // Fallback content or error message could be better, but for now fallback to row data
            setDetailOrder(order);
        }
    };

    // Calculate quick stats for the current page
    const currentPageRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 140,
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 200,
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{text}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{record.customerPhone}</span>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            width: 150,
            align: 'right', // Align right for numbers
            render: (total) => <span style={{ color: '#d48806', fontWeight: 'bold', fontSize: '15px' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>,
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            width: 160,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color="geekblue" style={{ marginBottom: 4 }}>
                        {record.paymentMethod ? record.paymentMethod.toUpperCase() : 'N/A'}
                    </Tag>
                    <Tag 
                        color={record.paymentStatus === 'paid' ? 'success' : 'warning'} 
                        style={{ width: 'fit-content' }}
                    >
                        {record.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            width: 150,
            align: 'center',
            render: (status, record) => {
                let color = 'default';
                let label = 'Unknown';
                
                switch(status) {
                    case 'pending': color = 'orange'; label = 'Chờ xử lý'; break;
                    case 'confirmed': color = 'blue'; label = 'Đã xác nhận'; break;
                    case 'processing': color = 'cyan'; label = 'Đang xử lý'; break;
                    case 'shipping': color = 'purple'; label = 'Đang giao'; break;
                    case 'delivered': color = 'green'; label = 'Đã giao'; break;
                    case 'cancelled': color = 'red'; label = 'Đã hủy'; break;
                    default: label = status;
                }
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                         <Tag color={color} style={{ minWidth: 80, textAlign: 'center', margin: 0 }}>{label}</Tag>
                         <Tooltip title="Cập nhật trạng thái">
                             <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                size="small" 
                                onClick={() => openUpdateStatusModal(record)}
                             />
                         </Tooltip>
                    </div>
                );
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (date) => (
                <div style={{ fontSize: '13px' }}>
                    <div>{new Date(date).toLocaleTimeString('vi-VN')}</div>
                    <div style={{ color: '#888' }}>{new Date(date).toLocaleDateString('vi-VN')}</div>
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="primary" size="small" ghost icon={<EyeOutlined />} onClick={() => openDetailModal(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];


    return (
        <div style={{ padding: '20px' }}>
            {/* Quick Stats Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic 
                            title="Tổng đơn hàng" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic 
                            title="Tổng doanh thu" 
                            value={stats.totalRevenue} 
                            prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />} 
                            precision={0}
                            formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic 
                            title="Đơn chờ xử lý" 
                            value={stats.ordersByStatus?.pending || 0} 
                            prefix={<SyncOutlined spin={stats.ordersByStatus?.pending > 0} style={{ color: '#faad14' }} />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Danh sách đơn hàng" bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                                onChange={handleStatusChangeFilter}
                                value={statusFilter || undefined}
                                allowClear
                            >
                                <Option value="pending">Chờ xử lý (Pending)</Option>
                                <Option value="confirmed">Đã xác nhận (Confirmed)</Option>
                                <Option value="processing">Đang xử lý (Processing)</Option>
                                <Option value="shipping">Đang giao hàng (Shipping)</Option>
                                <Option value="delivered">Đã giao hàng (Delivered)</Option>
                                <Option value="cancelled">Đã hủy (Cancelled)</Option>
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
                    bordered // Add border for better definition
                    size="middle" // Make compact
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

            {/* Update Status Modal */}
            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={isStatusModalVisible}
                onOk={handleUpdateStatus}
                onCancel={() => setIsStatusModalVisible(false)}
                confirmLoading={updatingStatus}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <div style={{ marginBottom: 16 }}>
                    <span style={{ fontWeight: 'bold' }}>Mã đơn hàng:</span> {selectedOrder?.orderNumber}
                </div>
                <div>
                   <span style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Trạng thái mới:</span>
                   <Select 
                        value={newStatus} 
                        onChange={setNewStatus} 
                        style={{ width: '100%' }}
                    >
                        <Option value="pending">Chờ xử lý (Pending)</Option>
                        <Option value="confirmed">Đã xác nhận (Confirmed)</Option>
                        <Option value="processing">Đang xử lý (Processing)</Option>
                        <Option value="shipping">Đang giao hàng (Shipping)</Option>
                        <Option value="delivered">Đã giao hàng (Delivered)</Option>
                        <Option value="cancelled">Hủy đơn hàng (Cancelled)</Option>
                   </Select>
                </div>
            </Modal>

            {/* Order Details Modal Component */}
            <OrderDetailModal 
                open={isDetailModalVisible}
                onClose={() => setIsDetailModalVisible(false)}
                order={detailOrder}
            />
        </div>
    );
};

export default OrderManagement;

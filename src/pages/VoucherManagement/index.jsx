import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Tag,
  message,
  Input,
  DatePicker,
  Popconfirm
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import dayjs from 'dayjs';

const VoucherManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      // API call to /vouchers/admin/all
      // Note: Assuming the API supports query params for pagination if needed, 
      // but the prompt only gave the response format. 
      // I will assume standard query params or just fetch all if pagination is handled client side or server side for 'all'.
      // Given the response has pagination object, the server likely supports pagination params.
      // But the endpoint is ".../all", which implies retrieving everything? 
      // However, the JSON response contains "pagination", so it's paginated.
      // I'll pass page and limit.
      
      const response = await axiosInstance.get('/vouchers/admin/all', {
        params: {
          page,
          limit: pageSize
        }
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, 20);
  }, [fetchData]);

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize);
  };

  // Placeholder functions for CRUD
  const handleAdd = () => {
    message.info('Chức năng thêm voucher đang phát triển');
  };

  const handleEdit = (record) => {
    message.info(`Chỉnh sửa voucher: ${record.code}`);
  };

  const handleDelete = (id) => {
    message.info(`Xóa voucher id: ${id}`);
    // Implement delete API call here if available, e.g.:
    // await axiosInstance.delete(`/vouchers/${id}`);
    // fetchData(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color={text === 'DISCOUNT' ? 'green' : 'orange'}>{text}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      render: (_, record) => (
        <div>
          <div>{record.discountPercent}%</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            Tối đa: {record.maxDiscount?.toLocaleString('vi-VN')}đ
          </div>
        </div>
      )
    },
    {
      title: 'Điều kiện',
      key: 'condition',
      render: (_, record) => (
        <div>
           Min: {record.minOrderAmount?.toLocaleString('vi-VN')}đ
        </div>
      )
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (_, record) => (
        <span>
            {record.usedCount} / {record.usageLimit}
        </span>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>BĐ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</div>
          <div>KT: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>Quản lý Voucher</h2>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Thêm Voucher
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `Tổng ${total} voucher`,
            showSizeChanger: true
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default VoucherManagement;

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
  Popconfirm
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import dayjs from 'dayjs';
import VoucherFormModal from './VoucherFormModal';

const VoucherManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vouchers/admin/all', {
        params: {
          page,
          limit: pageSize
        }
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination?.page || 1,
          pageSize: response.data.pagination?.limit || 20,
          total: response.data.pagination?.total || 0
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

  // Open Modal for Create
  const handleAdd = () => {
    setEditingVoucher(null);
    setIsModalVisible(true);
  };

  // Open Modal for Edit
  const handleEdit = (record) => {
    setEditingVoucher(record);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
  };

  const handleSubmitModal = async (values) => {
    setModalLoading(true);
    try {
        if (editingVoucher) {
            // Update existing voucher
            // Assuming endpoint might be PUT /vouchers/admin/:id or similar
            // Since User only gave POST example, I'll assume standard REST if possible, 
            // but for now I'll just focus on Create as requested specifically.
            // However, to make the Edit button work if clicked:
            message.info('Tính năng cập nhật chưa được cấu hình API cụ thể');
             // TODO: Add Update API call here
        } else {
            // Create new voucher
            const response = await axiosInstance.post('/vouchers/admin', values);
            if (response.data.success || response.data) { // Check response format based on typical responses
                message.success('Tạo voucher thành công');
                setIsModalVisible(false);
                fetchData(1, pagination.pageSize); // Reset to first page to see new item
            }
        }
    } catch (error) {
        console.error('Error submitting voucher:', error);
        const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher';
        message.error(errorMsg);
    } finally {
        setModalLoading(false);
    }
  };

  const handleDelete = (id) => {
    message.info(`Xóa voucher id: ${id}`);
    // Implement delete API call here if available
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

      <VoucherFormModal
        visible={isModalVisible}
        onCancel={handleCancelModal}
        onSubmit={handleSubmitModal}
        loading={modalLoading}
        initialValues={editingVoucher}
      />
    </div>
  );
};

export default VoucherManagement;

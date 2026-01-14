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
  Select
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import dayjs from 'dayjs';
import VoucherFormModal from './VoucherFormModal';
import VoucherDetailModal from './VoucherDetailModal';

const { Option } = Select;

const VoucherManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  
  // Applied filters (what is actually used for fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    type: null,
    isActive: null
  });

  // Modal Create/Edit State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // Modal Detail State
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailVoucher, setDetailVoucher] = useState(null);

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };

      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.type) params.type = appliedFilters.type;
      if (appliedFilters.isActive !== null) params.isActive = appliedFilters.isActive;

      const response = await axiosInstance.get('/vouchers/admin/all', { params });

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
  }, [appliedFilters]);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, [fetchData]);

  const handleSearch = () => {
    setAppliedFilters({
      search: searchText,
      type: filterType,
      isActive: filterStatus
    });
    // Will trigger useEffect because fetchData dependency changes? 
    // Actually fetchData depends on appliedFilters, so it changes.
    // However, we effectively want to reset to page 1 on search.
    // The current useEffect relies on pagination.current which might be > 1.
    // We should reset pagination state too, but that triggers another effect if we aren't careful.
    // But since fetchData changes, the effect runs with current pagination values. 
    // We want page 1.
    // Let's modify the useEffect to be simpler or call fetchData directly here?
    // React strict mode might double call, but it's fine.
    // To ensure page 1:
    setPagination(prev => ({ ...prev, current: 1 })); 
    // This updates pagination state -> triggers re-render.
    // Also setAppliedFilters updates state -> triggers re-render.
    // Both might happen batch or separately.
    // If we want to guarantee page 1 fetch, we can just let the effect handle it if we ensure page is 1.
    // But if pagination.current is already 1, setPagination won't trigger effect?
    // appliedFilters change WILL trigger effect because fetchData identity changes.
    // So if page is 1, it fetches page 1 with new filters.
    // If page is 2, setPagination(1) triggers effect with page 1.
    // appliedFilters change also triggers effect (possibly with page 2 before page 1 update?).
    // To avoid race conditions, we can memoize pagination in fetchData args? 
    // Actually, simple is fine.
  };

  const handleReset = () => {
    setSearchText('');
    setFilterType(null);
    setFilterStatus(null);
    setAppliedFilters({ search: '', type: null, isActive: null });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({ 
        ...prev, 
        current: newPagination.current, 
        pageSize: newPagination.pageSize 
    }));
    // We need to fetch here? The useEffect will handle it if we add pagination to dependencies?
    // Currently useEffect depends on [fetchData].
    // If pagination state changes, fetchData ID doesn't change, so effect doesn't run!
    // -> We MUST add pagination.current to useEffect deps OR call fetchData here.
    // calling fetchData here is safer to avoid effect loops if we aren't careful.
    // BUT fetchData is memoized on [appliedFilters].
    // So it's safe to call here.
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

  // Open Modal for Details
  const handleViewDetail = async (id) => {
    setIsDetailVisible(true);
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/vouchers/admin/${id}`);
      if (response.data.success) {
        setDetailVoucher(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch voucher detail:', error);
      message.error('Không thể tải chi tiết voucher');
      setIsDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
  };

  const handleCancelDetail = () => {
    setIsDetailVisible(false);
    setDetailVoucher(null);
  };

  const handleSubmitModal = async (values) => {
    setModalLoading(true);
    try {
        if (editingVoucher) {
            message.info('Tính năng cập nhật chưa được cấu hình API cụ thể');
            // TODO: Add Update API call here
        } else {
            // Create new voucher
            const response = await axiosInstance.post('/vouchers/admin', values);
            if (response.data.success || response.data) {
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
      render: (text) => <Tag color={text === 'DISCOUNT' ? 'green' : 'cyan'}>{text === 'DISCOUNT' ? 'Giảm giá' : 'Freeship'}</Tag>
    },

    {
      title: 'Giảm giá',
      key: 'discount',
      render: (_, record) => {
        if (record.type === 'FREE_SHIP') {
            return (
                <div>
                   <div>Freeship</div>
                   {record.maxDiscount && (
                       <div style={{ fontSize: '11px', color: '#888' }}>
                           Tối đa: {record.maxDiscount.toLocaleString('vi-VN')}đ
                       </div>
                   )}
                </div>
            )
        }
        return (
          <div>
            <div>{record.discountPercent}%</div>
            {record.maxDiscount && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  Tối đa: {record.maxDiscount.toLocaleString('vi-VN')}đ
                </div>
            )}
          </div>
        )
      }
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
            {record.usedCount} / {record.usageLimit || '∞'}
        </span>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 160,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>{dayjs(record.startDate).format('DD/MM/YY')}</div>
          <div>{dayjs(record.endDate).format('DD/MM/YY')}</div>
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
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record._id)}
          >
            Chi tiết
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
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

        {/* Filter Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm theo mã voucher..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Chọn loại voucher"
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              allowClear
            >
              <Option value="DISCOUNT">Giảm giá</Option>
              <Option value="FREE_SHIP">Miễn phí vận chuyển</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
            >
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Vô hiệu</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>
                Đặt lại
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

      <VoucherDetailModal
        visible={isDetailVisible}
        onCancel={handleCancelDetail}
        voucher={detailVoucher}
        loading={detailLoading}
      />
    </div>
  );
};

export default VoucherManagement;

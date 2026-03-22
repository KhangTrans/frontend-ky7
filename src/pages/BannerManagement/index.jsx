import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Space, Card, Tag, Switch, Modal, 
  Input, Typography, message, Tooltip, Image, Badge 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, PictureOutlined,
  CalendarOutlined, PercentageOutlined, SortAscendingOutlined
} from '@ant-design/icons';
import { bannerAPI } from '../../api';
import BannerFormModal from './BannerFormModal';
import dayjs from 'dayjs';

const { Title } = Typography;

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bannerAPI.getAdminAll();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      message.error('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await bannerAPI.toggle(id);
      if (res.success) {
        message.success(`Đã ${!currentStatus ? 'bật' : 'tắt'} banner thành công`);
        // Optimistic update
        setBanners(prev => prev.map(b => b._id === id ? { ...b, isActive: !currentStatus } : b));
      }
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa banner?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await bannerAPI.delete(id);
          if (res.success) {
            message.success('Đã xóa banner');
            fetchBanners();
          }
        } catch (error) {
          message.error('Xóa thất bại');
        }
      }
    });
  };

  const showModal = (banner = null, mode = 'add') => {
    setEditingBanner(banner);
    setModalMode(mode);
    setIsModalVisible(true);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchBanners();
  };

  const filteredBanners = banners.filter(b => 
    b.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Ảnh Banner',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 150,
      render: (url) => (
        <Image 
          src={url} 
          alt="Banner" 
          width={120} 
          height={60} 
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/120x60?text=No+Image"
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 120,
      render: (val) => <Tag color="red" icon={<PercentageOutlined />}>{val}%</Tag>,
      sorter: (a, b) => a.discountPercent - b.discountPercent,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      align: 'center',
      render: (val) => <Badge count={val || 0} color="blue" showZero />,
      sorter: (a, b) => (a.order || 0) - (b.order || 0),
    },
    {
      title: 'Thời hạn',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Từ: {dayjs(record.startDate).format('DD/MM/YYYY')}
          </span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Đến: {dayjs(record.endDate).format('DD/MM/YYYY')}
          </span>
          {dayjs().isAfter(dayjs(record.endDate)) && <Tag color="error" size="small">Hết hạn</Tag>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={() => handleToggle(record._id, isActive)} 
          size="small"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="small" 
                onClick={() => showModal(record, 'edit')} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small" 
                onClick={() => handleDelete(record._id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            <PictureOutlined style={{ marginRight: 12 }} />
            Quản lý Banner Khuyến mãi
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => showModal()}
          >
            Thêm Banner
          </Button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Input 
            placeholder="Tìm kiếm theo tiêu đề..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} style={{ marginLeft: 12 }} onClick={fetchBanners}>
            Làm mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredBanners} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} banner` }}
        />
      </Card>

      <BannerFormModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
        editingBanner={editingBanner}
        mode={modalMode}
      />
    </div>
  );
};

export default BannerManagement;

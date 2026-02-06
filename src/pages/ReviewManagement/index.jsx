import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Button, Space, Modal, Input, 
  Select, message, Tooltip, Avatar, Typography, Popconfirm, Card 
} from 'antd';
import { 
  DeleteOutlined, MessageOutlined, StarFilled, 
  UserOutlined, SearchOutlined, FilterOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reviewAPI } from '../../api';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ReviewManagement = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    rating: '', // '' = all
    isReplied: '', // '' = all
  });

  // Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      // Clean empty filters
      if (params.rating === '') delete params.rating;
      if (params.isReplied === '') delete params.isReplied;

      const response = await reviewAPI.getAdminReviews(params);
      
      if (response.success) {
        setData(response.data.reviews);
        setPagination({
          ...pagination,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  // Filter Handlers
  const handleRatingChange = (value) => {
    setFilters(prev => ({ ...prev, rating: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to page 1
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, isReplied: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Action Handlers
  const handleDelete = async (reviewId) => {
    try {
      await reviewAPI.delete(reviewId);
      message.success('Xóa đánh giá thành công');
      fetchReviews(); // Reload
    } catch (error) {
      message.error('Xóa đánh giá thất bại');
    }
  };

  const openReplyModal = (review) => {
    setCurrentReview(review);
    setReplyContent(''); // Reset content
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setReplyLoading(true);
      await reviewAPI.reply(currentReview._id, { comment: replyContent });
      message.success('Đã gửi phản hồi');
      setReplyModalOpen(false);
      fetchReviews(); // Reload to update status
    } catch (error) {
      message.error('Gửi phản hồi thất bại');
    } finally {
      setReplyLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      width: 250,
      render: (product) => (
        <Space>
          <Avatar 
            shape="square" 
            size={48} 
            src={Array.isArray(product?.images) ? product.images[0] : product?.image} 
          />
          <div style={{ maxWidth: 180 }}>
            <Text ellipsis={{ tooltip: product?.name }} strong>
              {product?.name || 'Sản phẩm không xác định'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      width: 180,
      render: (user) => (
        <Space>
          <Avatar src={user?.avatar} icon={<UserOutlined />} />
          <Text ellipsis>{user?.fullName || user?.username || 'Ẩn danh'}</Text>
        </Space>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'review',
      render: (_, record) => (
        <div>
          <div style={{ color: '#fadb14', marginBottom: 4 }}>
            {[...Array(5)].map((_, i) => (
              <StarFilled key={i} style={{ color: i < record.rating ? '#fadb14' : '#f0f0f0' }} />
            ))}
            <span style={{ color: '#999', marginLeft: 8 }}>({record.rating}/5)</span>
          </div>
          <Tooltip title={record.comment}>
            <div style={{ 
              maxWidth: 300, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {record.comment}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        record.reply ? (
          <Tag color="success">Đã trả lời</Tag>
        ) : (
          <Tag color="default">Chưa trả lời</Tag>
        )
      ),
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.reply ? (
            <Tooltip title="Trả lời">
              <Button 
                type="primary" 
                ghost 
                icon={<MessageOutlined />} 
                size="small"
                onClick={() => openReplyModal(record)} 
              />
            </Tooltip>
          ) : (
            <Tooltip title="Đã trả lời">
                <Button 
                    type="dashed" 
                    icon={<MessageOutlined />} 
                    disabled 
                    size="small"
                />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Xóa đánh giá?"
            description="Bạn có chắc chắn muốn xóa đánh giá này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small" 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý Đánh giá & Nhận xét" bordered={false}>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Select 
            placeholder="Lọc theo sao" 
            style={{ width: 150 }} 
            allowClear 
            onChange={handleRatingChange}
          >
            <Option value="5">5 Sao</Option>
            <Option value="4">4 Sao</Option>
            <Option value="3">3 Sao</Option>
            <Option value="2">2 Sao</Option>
            <Option value="1">1 Sao</Option>
          </Select>

          <Select 
            placeholder="Trạng thái phản hồi" 
            style={{ width: 180 }} 
            allowClear 
            onChange={handleStatusChange}
          >
            <Option value="true">Đã trả lời</Option>
            <Option value="false">Chưa trả lời</Option>
          </Select>
          
          {/* Quick Filter: Cần phản hồi */}
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => handleStatusChange('false')}
          >
            Cần trả lời ngay
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Reply Modal */}
      <Modal
        title={
            <span>
                Trả lời đánh giá của 
                <strong> {currentReview?.user?.fullName || 'Khách hàng'} </strong>
            </span>
        }
        open={replyModalOpen}
        onOk={handleReplySubmit}
        onCancel={() => setReplyModalOpen(false)}
        confirmLoading={replyLoading}
        okText="Gửi phản hồi"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Nội dung đánh giá:</div>
            <div style={{ fontStyle: 'italic', color: '#666' }}>"{currentReview?.comment}"</div>
        </div>
        <TextArea
          rows={4}
          placeholder="Nhập nội dung phản hồi từ Shop..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReviewManagement;

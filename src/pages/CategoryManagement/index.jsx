import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Image,
  Modal,
  Typography,
} from 'antd';

const { Text } = Typography;
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
} from '../../redux/slices/categorySlice';
import CategoryFormModal from './CategoryFormModal';

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { items: categories, loading, error, pagination } = useSelector((state) => state.categories);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'view', 'add', 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // Load categories function
  const loadCategories = useCallback((searchQuery = '') => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    
    if (searchQuery) params.search = searchQuery;
    
    dispatch(fetchCategories(params));
  }, [currentPage, pageSize, dispatch]);

  // Load categories khi component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (error) {
      console.error('Category error:', error);
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const showModal = (category = null, mode = 'add') => {
    setEditingCategory(category);
    setViewingCategory(category);
    setModalMode(mode);
    setIsModalVisible(true);
    
    // Set form values sau khi modal đã mở để tránh double render
    setTimeout(() => {
      if (category && (mode === 'edit' || mode === 'view')) {
        form.setFieldsValue({
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          publicId: category.publicId || '',
          isActive: category.isActive,
        });
      } else {
        form.resetFields();
      }
    }, 0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setViewingCategory(null);
    setModalMode('add');
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Remove publicId from values nếu backend không hỗ trợ
      const { publicId: _publicId, ...categoryData } = values;
      
      if (editingCategory) {
        const categoryId = editingCategory.id || editingCategory._id;
        if (!categoryId) {
          message.error('Không tìm thấy ID của category!');
          return;
        }
        await dispatch(updateCategory({ id: String(categoryId), categoryData })).unwrap();
        message.success('Cập nhật thể loại thành công!');
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
        message.success('Thêm thể loại thành công!');
      }
      
      handleCancel();
      // Không cần loadCategories() vì Redux đã tự update state
    } catch (error) {
      console.error('Error:', error);
      message.error(error || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Xóa thể loại thành công!');
      // Không cần loadCategories() vì Redux đã tự xóa item khỏi state
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCategories(searchText.trim());
  };

  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  const handleReset = () => {
    setSearchText('');
    setCurrentPage(1);
    loadCategories('');
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl) => (
        <Image
          src={imageUrl || 'https://via.placeholder.com/80'}
          alt="Category"
          style={{ 
            width: 80, 
            height: 80, 
            objectFit: 'cover', 
            borderRadius: 8,
            border: '2px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          fallback="https://via.placeholder.com/80"
        />
      ),
    },
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>{name}</span>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <span style={{ color: '#666' }}>
          {description && description.length > 50 
            ? `${description.substring(0, 50)}...` 
            : description}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      align: 'center',
      render: (isActive) => (
        <Tag 
          color={isActive ? 'success' : 'error'}
          style={{ 
            fontWeight: 500,
            padding: '4px 12px',
            borderRadius: 12
          }}
        >
          {isActive ? '✓ Kích hoạt' : '✗ Vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showModal(record, 'view')}
            style={{ 
              borderColor: '#1890ff',
              color: '#1890ff'
            }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record, 'edit')}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa thể loại này?"
            onConfirm={() => handleDelete(record.id || record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
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
      <Card
        bordered={false}
        style={{ 
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        title={
          <Space size="large">
            <AppstoreOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              Quản lý thể loại
            </span>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
              {pagination.total || 0} thể loại
            </Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => showModal(null, 'add')}
            style={{ 
              borderRadius: 8,
              height: 40,
              fontWeight: 500
            }}
          >
            Thêm thể loại mới
          </Button>
        }
      >
        {/* Search và Filter */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={10}>
            <Input
              placeholder="Tìm kiếm theo tên thể loại..."
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
              style={{ borderRadius: 8 }}
              allowClear
            />
          </Col>
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Tìm kiếm
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey={(record) => record.id || record._id}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} thể loại`,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          style={{
            borderRadius: 8,
            overflow: 'hidden'
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      {/* Modal thêm/sửa/xem */}
      <CategoryFormModal
        visible={isModalVisible}
        mode={modalMode}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        editingCategory={editingCategory}
        viewingCategory={viewingCategory}
        loading={loading}
        onEdit={() => setModalMode('edit')}
      />
    </div>
  );
};

export default CategoryManagement;

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
  Select,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError,
  fetchCategories,
} from '../../redux/slices/productSlice';
import ProductFormModal from './ProductFormModal';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error, pagination, categories } = useSelector((state) => state.products);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // Active filters - những filter đang được áp dụng
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // Load products function - chỉ phụ thuộc vào activeSearch và activeCategory
  const loadProducts = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    
    if (activeSearch) params.search = activeSearch;
    if (activeCategory) params.category = activeCategory;
    
    dispatch(fetchProducts(params));
  }, [currentPage, pageSize, activeSearch, activeCategory, dispatch]);

  // Load categories và products khi component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Load products khi component mount hoặc currentPage/pageSize/activeFilters thay đổi
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const showModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      const formData = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId?._id || product.categoryId?.id || product.categoryId,
        images: product.images || [],
        variants: product.variants || [],
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Chuẩn hóa dữ liệu theo đúng format yêu cầu
      const formattedValues = {
          ...values,
          // Đảm bảo images có đủ trường
          images: values.images?.map((img, index) => ({
              imageUrl: img.imageUrl,
              publicId: img.publicId, // Giữ lại publicId để xóa ảnh nếu cần
              isPrimary: !!img.isPrimary, // Convert sang boolean
              order: img.order !== undefined ? Number(img.order) : index
          })) || [],
          // Đảm bảo variants số liệu chuẩn
          variants: values.variants?.map(v => ({
              name: v.name,
              sku: v.sku,
              price: Number(v.price), // Ensure number
              stock: Number(v.stock), // Ensure number
              color: v.color,
              size: v.size
          })) || []
      };

      console.log('Submitting Product Data:', JSON.stringify(formattedValues, null, 2));
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id || editingProduct.id, productData: formattedValues })).unwrap();
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await dispatch(createProduct(formattedValues)).unwrap();
        message.success('Thêm sản phẩm thành công!');
      }
      
      handleCancel();
      loadProducts();
    } catch (error) {
      console.error('Submit Error:', error);
      // Lỗi chi tiết đã được handle trong slice và trả về message string
      // message.error đã được hiển thị nếu component dùng useEffect error
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success('Xóa sản phẩm thành công!');
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchText.trim());
    setActiveCategory(selectedCategory);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // Nếu đã ở page 1, trigger load manually
      const params = {
        page: 1,
        limit: pageSize,
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (selectedCategory) params.category = selectedCategory;
      dispatch(fetchProducts(params));
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // Không tự động search, chờ user nhấn nút
  };

  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategory('');
    setActiveSearch('');
    setActiveCategory('');
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      dispatch(fetchProducts({ page: 1, limit: pageSize }));
    }
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
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => {
        const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
        return primaryImage ? (
          <img 
            src={primaryImage.imageUrl} 
            alt="Product" 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} />
        );
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${parseInt(price || 0).toLocaleString('vi-VN')} đ`,
      sorter: (a, b) => parseInt(a.price || 0) - parseInt(b.price || 0),
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (category) => <Tag color="blue">{category?.name || 'Chưa phân loại'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-management" style={{ padding: 0, width: '100%' }}>
      <Card>
        <div style={{ marginBottom: 24, padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Typography.Title level={2} style={{ margin: 0, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingOutlined /> Quản lý sản phẩm
          </Typography.Title>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            size="large"
            style={{ flex: '1 1 300px', minWidth: 200 }}
          />
          <Select
            placeholder="Chọn danh mục"
            value={selectedCategory || undefined}
            onChange={handleCategoryChange}
            allowClear
            loading={loading && categories.length === 0}
            size="large"
            style={{ flex: '0 1 180px', minWidth: 150 }}
          >
            {categories.map((cat) => (
              <Select.Option key={cat._id || cat.id} value={cat.name}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            size="large"
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="large"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            size="large"
          >
            Thêm sản phẩm
          </Button>
        </div>

        {/* Stats Row */}
        <div style={{ 
          padding: '12px 16px', 
          background: '#f0f2f5', 
          borderRadius: '4px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Space size="large" wrap>
            <span>
              <strong>Tổng số:</strong> {pagination?.total || products.length} sản phẩm
            </span>
            <span>
              <strong>Trang:</strong> {currentPage}/{Math.ceil((pagination?.total || products.length) / pageSize) || 1}
            </span>
          </Space>
          {(activeSearch || activeCategory) && (
            <Tag color="blue">
              Đang lọc: {activeSearch && `"${activeSearch}"`} 
              {activeSearch && activeCategory && ' - '}
              {activeCategory && `Danh mục: ${activeCategory}`}
            </Tag>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination?.total || products.length,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <ProductFormModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        editingProduct={editingProduct}
        categories={categories}
        loading={loading}
      />
    </div>
  );
};

export default ProductManagement;

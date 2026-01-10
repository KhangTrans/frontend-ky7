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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
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
        categoryId: product.category?.id || product.category?._id || product.categoryId,
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
      console.log('Submitting Product Data:', JSON.stringify(values, null, 2));
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id || editingProduct.id, productData: values })).unwrap();
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await dispatch(createProduct(values)).unwrap();
        message.success('Thêm sản phẩm thành công!');
      }
      
      handleCancel();
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
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
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category?.name || 'Chưa phân loại'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>Quản lý sản phẩm</h2>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn danh mục"
              style={{ width: '100%' }}
              value={selectedCategory || undefined}
              onChange={handleCategoryChange}
              allowClear
              loading={loading && categories.length === 0}
            >
              {categories.map((cat) => (
                <Select.Option key={cat._id || cat.id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>

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

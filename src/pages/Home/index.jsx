import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Input, Spin, Empty, message, Modal } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, HeartOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';
import { addToCart, fetchCart } from '../../redux/slices/cartSlice';
import HomeNavbar from '../../components/HomeNavbar';
import Footer from '../../components/Footer';
import VoucherList from '../../components/VoucherList';
import BannerCarousel from '../../components/BannerCarousel';
import { useBanners } from '../../hooks/useBanners';
import './Home.css';

const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { items: products, loading, error, categories } = useSelector((state) => state.products);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(null);
  
  // Get banner info
  const { banners, hasBanners } = useBanners();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');
  
  // Set initial banner
  useEffect(() => {
    if (banners.length > 0 && !currentBanner) {
      setCurrentBanner(banners[0]);
    }
  }, [banners, currentBanner]);
  
  // Handle banner change callback
  const handleBannerChange = useCallback((banner) => {
    setCurrentBanner(banner);
  }, []);

  // Load categories và products khi component mount
  // Load categories và products khi component mount (Chạy 1 lần)
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Load cart nếu đã đăng nhập (Chạy khi auth state thay đổi)
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [dispatch, isLoggedIn]);

  // Filter products based on category và search
  useEffect(() => {
    let filtered = products || [];
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product.categoryId?.name || product.category?.name) === selectedCategory
      );
    }
    
    // Filter by search text
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.description?.toLowerCase().includes(lowerSearch)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchText]);

  // Show error message
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleProductClick = (productId) => {
    console.log('Clicked Product ID:', productId);
    // Navigate to product detail page
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    
    console.log('handleAddToCart called', { product });
    
    // Kiểm tra đăng nhập - check real-time, không dùng constant
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, showing message');
      // Sử dụng message.warning từ Ant Design (đã tương thích với React 18)
      messageApi.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }
    
    console.log('User is logged in, adding to cart');
    try {
      await dispatch(addToCart({ 
        productId: product._id || product.id, 
        quantity: 1 
      })).unwrap();
      
      // Update cart count immediately
      dispatch(fetchCart());
      
      messageApi.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      messageApi.error(error || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    // TODO: Add to wishlist logic
    messageApi.success(`Đã thêm ${product.name} vào danh sách yêu thích!`);
  };

  return (
    <div className="home-container">
      {contextHolder}
      {/* Navigation Bar */}
      <HomeNavbar />
      
      {/* Hero Section with Banner */}
      <section className="hero-section">
        {/* Banner as Background */}
        <BannerCarousel onBannerChange={handleBannerChange} />
        
        {/* Overlay Content */}
        <div className="hero-overlay-content">
          {hasBanners && currentBanner?.title ? (
            // Hiển thị title từ banner
            <>
              <h1 className="hero-title banner-dynamic-title">
                {currentBanner.title}
              </h1>
              {currentBanner.subtitle && (
                <p className="hero-subtitle">{currentBanner.subtitle}</p>
              )}
            </>
          ) : (
            // Hiển thị text mặc định khi không có banner
            <>
              <h1 className="hero-title">
                Khám Phá Bộ Sưu Tập
                <span className="hero-gradient"> Đặc Biệt</span>
              </h1>
              <p className="hero-subtitle">
                Những sản phẩm chất lượng cao với giá tốt nhất
              </p>
            </>
          )}
          
          <div className="hero-search">
            <Search
              placeholder="Tìm kiếm sản phẩm bạn yêu thích..."
              allowClear
              enterButton={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SearchOutlined />
                  Tìm kiếm
                </span>
              }
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              className="hero-search-input"
            />
          </div>
        </div>
      </section>

      {/* Voucher Section */}
      <VoucherList />

      {/* Main Content */}
      <div className="main-content">
        {/* Category Filter */}
        <section className="category-section">
          <div className="container">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
            <div className="category-filter">
              <button
                className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span className="chip-icon">🏷️</span>
                <span className="chip-text">Tất cả</span>
                <span className="chip-count">{products?.length || 0}</span>
              </button>
              
              {categories.map((category) => {
                const categoryCount = products?.filter(
                  p => (p.categoryId?.name || p.category?.name) === category.name
                ).length || 0;
                
                return (
                  <button
                    key={category.id}
                    className={`category-chip ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.name)}
                  >
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="chip-image" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                    ) : null}
                    {!category.imageUrl && <span className="chip-icon">📦</span>}
                    <span className="chip-text">{category.name}</span>
                    <span className="chip-count">{categoryCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-section">
          <div className="container">
            <div className="products-header">
              <h2 className="section-title">
                {selectedCategory === 'all' 
                  ? 'Tất Cả Sản Phẩm' 
                  : `Danh Mục: ${selectedCategory}`}
              </h2>
              <p className="products-count">
                Hiển thị {filteredProducts.length} sản phẩm
              </p>
            </div>

            {loading && filteredProducts.length === 0 ? (
              <div className="loading-container">
                <Spin size="large" tip="Đang tải sản phẩm..." />
              </div>
            ) : filteredProducts.length === 0 && !loading ? (
              <Empty
                description={
                  searchText 
                    ? `Không tìm thấy sản phẩm phù hợp với "${searchText}"`
                    : "Không có sản phẩm nào"
                }
                className="empty-state"
              />
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  const imageUrl = primaryImage?.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
                  
                  return (
                    <div
                      key={product._id || product.id}
                      className="product-card"
                      onClick={() => handleProductClick(product._id || product.id)}
                    >
                      <div className="product-image-container">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                        <div className="product-overlay">
                          <button
                            className="product-action-btn"
                            onClick={(e) => handleAddToWishlist(e, product)}
                            title="Thêm vào yêu thích"
                          >
                            <HeartOutlined />
                          </button>
                          <button
                            className="product-action-btn"
                            onClick={(e) => handleProductClick(product._id || product.id)}
                            title="Xem chi tiết"
                          >
                            <EyeOutlined />
                          </button>
                        </div>
                        
                        {product.stock === 0 && (
                          <div className="product-badge out-of-stock">Hết hàng</div>
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <div className="product-badge low-stock">Sắp hết</div>
                        )}
                      </div>

                      <div className="product-info">
                        <div className="product-category">
                          {product.categoryId?.name || product.category?.name || 'Chưa phân loại'}
                        </div>
                        <h3 className="product-name" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="product-description" title={product.description}>
                          {product.description || 'Không có mô tả'}
                        </p>
                        
                        <div className="product-footer">
                          <div className="product-price-container">
                            <span className="product-price">
                              {parseInt(product.price || 0).toLocaleString('vi-VN')}đ
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="product-original-price">
                                {parseInt(product.originalPrice).toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                          
                          <button
                            className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCartOutlined />
                            {product.stock === 0 ? 'Hết hàng' : 'Thêm'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, InputNumber, Breadcrumb, Spin, message, Rate, Tabs, Card } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, fetchCart } from '../../redux/slices/cartSlice';
import axiosInstance from '../../api/axiosConfig';
import HomeNavbar from '../../components/HomeNavbar';
import Footer from '../../components/Footer';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage(); // Dùng hook
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching Product Detail for ID:', id);
      const response = await axiosInstance.get(`/products/${id}`);
      console.log('API Response Data:', response.data?.data);
      
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        messageApi.error('Không tìm thấy sản phẩm!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      messageApi.error('Lỗi khi tải thông tin sản phẩm!');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }

    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity: quantity,
      })).unwrap();

      // Load lại giỏ hàng ngay lập tức để cập nhật số lượng trên Navbar
      dispatch(fetchCart());

      messageApi.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
      messageApi.error('Lỗi khi thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.warning('Vui lòng đăng nhập để mua hàng!');
      return;
    }

    // Chuyển hướng sang Checkout kèm data sản phẩm (không thêm vào giỏ hàng)
    navigate('/checkout', { 
      state: { 
        directPurchaseItem: {
          product: product,
          quantity: quantity
        }
      } 
    });
  };

  if (loading) {
    return (
      <>
        {contextHolder}
        <HomeNavbar />
        <div className="product-detail-loading">
          <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
        </div>
      </>
    );
  }

  if (!product) {
    return null;
  }

  // Parse images (có thể là array hoặc string)
  // Parse images (có thể là array objects, array strings hoặc string)
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => (typeof img === 'object' ? img.imageUrl : img))
    : product.image 
    ? [product.image] 
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <>
      {contextHolder}
      <HomeNavbar />
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb-section">
          <Breadcrumb
            items={[
              {
                href: '/',
                title: <HomeOutlined />,
              },
              {
                href: '/',
                title: 'Sản phẩm',
              },
              {
                title: product.name,
              },
            ]}
          />
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Quay lại
          </Button>
        </div>

        {/* Main Content */}
        <div className="product-detail-content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={images[selectedImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <Rate disabled defaultValue={4.5} allowHalf />
              <span className="rating-text">(128 đánh giá)</span>
            </div>

            <div className="product-price">
              {product.salePrice < product.price && (
                <span className="original-price">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
              <span className="current-price">
                {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
              </span>
              {product.salePrice < product.price && (
                <span className="discount-badge">
                  -{Math.round((1 - product.salePrice / product.price) * 100)}%
                </span>
              )}
            </div>

            <div className="product-short-desc">
              <p>{product.shortDescription || product.description?.substring(0, 200) + '...' || 'Sản phẩm chất lượng cao'}</p>
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Thương hiệu:</span>
                <span className="meta-value">{product.brand || 'Đang cập nhật'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Kho hàng:</span>
                <span className="meta-value stock-status">
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Danh mục:</span>
                <span className="meta-value">{product.categoryId?.name || product.category?.name || 'Chưa phân loại'}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Số lượng:</label>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
                size="large"
              />
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="add-to-cart-btn"
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                type="default"
                size="large"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="buy-now-btn"
              >
                Mua ngay
              </Button>
              <Button
                type="text"
                size="large"
                icon={<HeartOutlined />}
                className="wishlist-btn"
              >
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <Tabs
            defaultActiveKey="1"
            size="large"
            items={[
              {
                key: '1',
                label: 'Mô tả sản phẩm',
                children: (
                  <div className="tab-content">
                    <div 
                      className="product-description"
                      dangerouslySetInnerHTML={{ 
                        __html: product.description || 'Đang cập nhật thông tin sản phẩm...' 
                      }}
                    />
                  </div>
                ),
              },
              {
                key: '2',
                label: 'Thông số kỹ thuật',
                children: (
                  <div className="tab-content">
                    <div className="specifications">
                      {product.specifications ? (
                        Object.entries(product.specifications).map(([key, value]) => (
                          <div className="spec-item" key={key}>
                            <span className="spec-label">{key}:</span>
                            <span className="spec-value">{value}</span>
                          </div>
                        ))
                      ) : (
                        <p>Đang cập nhật thông số kỹ thuật...</p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: '3',
                label: 'Đánh giá (128)',
                children: (
                  <div className="tab-content">
                    <p>Chức năng đánh giá đang được phát triển...</p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Related Products */}
        <div className="related-products-section">
          <h2>Sản phẩm liên quan</h2>
          <p className="section-subtitle">Các sản phẩm tương tự bạn có thể quan tâm</p>
          {/* TODO: Add related products */}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;

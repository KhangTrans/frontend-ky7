import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, InputNumber, Empty, Spin, message, Popconfirm } from 'antd';
import { 
  DeleteOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { fetchCart, updateCartItem, removeFromCart } from '../../redux/slices/cartSlice';
import HomeNavbar from '../../components/HomeNavbar';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading, total } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login');
      return;
    }

    // Fetch cart data
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    dispatch(updateCartItem({
      productId,
      quantity: newQuantity
    }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng!');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }
    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const product = item.productId || item.product || {};
      const price = product.salePrice || product.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <>
        <HomeNavbar />
        <div className="cart-loading">
          <Spin size="large" tip="Đang tải giỏ hàng..." />
        </div>
      </>
    );
  }

  return (
    <>
      <HomeNavbar />
      <div className="cart-container">
        <div className="cart-header">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className="back-btn"
          >
            Tiếp tục mua sắm
          </Button>
          <h1 className="cart-title">Giỏ hàng của bạn</h1>
          <p className="cart-subtitle">
            {items.length > 0 ? `${items.length} sản phẩm` : 'Giỏ hàng trống'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <h3>Giỏ hàng của bạn đang trống</h3>
                  <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
                </div>
              }
            >
              <Button 
                type="primary" 
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/')}
                className="shop-now-btn"
              >
                Mua sắm ngay
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items">
              {items.map((item) => {
                const product = item.productId || item.product || {};
                const price = product.salePrice || product.price || 0;
                const originalPrice = product.price || 0;
                const hasDiscount = product.salePrice && product.salePrice < product.price;
                const imageUrl = Array.isArray(product.images) 
                  ? product.images[0] 
                  : product.image || 'https://via.placeholder.com/150';

                return (
                  <div key={item._id || product._id} className="cart-item">
                    {/* Product Image */}
                    <div 
                      className="item-image"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img src={imageUrl} alt={product.name} />
                    </div>

                    {/* Product Info */}
                    <div className="item-info">
                      <h3 
                        className="item-name"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="item-category">{product.category?.name || 'Chưa phân loại'}</p>
                      
                      <div className="item-price">
                        <span className="current-price">
                          {price.toLocaleString('vi-VN')}đ
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="original-price">
                              {originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="discount-badge">
                              -{Math.round((1 - product.salePrice / product.price) * 100)}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity Controls - Mobile */}
                      <div className="item-actions-mobile">
                        <div className="quantity-control">
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          />
                          <span className="quantity-value">{item.quantity}</span>
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                            disabled={item.quantity >= (product.stock || 999)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls - Desktop */}
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        />
                        <InputNumber
                          min={1}
                          max={product.stock || 999}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(product._id, value)}
                          className="quantity-input"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                          disabled={item.quantity >= (product.stock || 999)}
                        />
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="item-subtotal">
                      <span className="subtotal-label">Tổng:</span>
                      <span className="subtotal-price">
                        {(price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="item-remove">
                      <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc muốn xóa sản phẩm này?"
                        onConfirm={() => handleRemoveItem(product._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          className="remove-btn"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h2>Thông tin đơn hàng</h2>
                
                <div className="summary-row">
                  <span>Tạm tính ({items.length} sản phẩm):</span>
                  <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free-shipping">Miễn phí</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Tổng cộng:</span>
                  <span className="total-price">
                    {calculateSubtotal().toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  className="checkout-btn"
                >
                  Thanh toán
                </Button>

                <div className="summary-note">
                  <p>💳 Hỗ trợ thanh toán COD, chuyển khoản</p>
                  <p>🚚 Miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
                  <p>🔄 Đổi trả trong vòng 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;

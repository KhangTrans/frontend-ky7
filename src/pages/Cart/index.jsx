import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, InputNumber, Empty, Spin, message, Popconfirm } from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  MinusOutlined,
  PlusOutlined,
  LoadingOutlined,
  EyeOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  addToCart,
} from "../../redux/slices/cartSlice";
import { fetchCategories } from "../../redux/slices/productSlice";
import { recommendationsAPI } from "../../api";
import HomeNavbar from "../../components/HomeNavbar";
import "../Home/Home.css";
import "../Products/Recommendations.css";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading, total } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để xem giỏ hàng!");
      navigate("/login");
      return;
    }
    dispatch(fetchCart());
    dispatch(fetchCategories());
  }, [dispatch, isAuthenticated, navigate]);

  const cartItemIds = items
    .map(
      (item) =>
        item.productId?._id ||
        item.product?._id ||
        item.productId ||
        item.product,
    )
    .join(",");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (items.length === 0) {
        try {
          const res = await recommendationsAPI.getTrending(4);
          if (res.success) setRecommendations(res.data.products);
        } catch (e) {
          console.error(e);
        }
        return;
      }

      try {
        const productsToFetch = items.slice(0, 2);
        const requests = productsToFetch
          .map((item) => {
            const pId =
              item.productId?._id ||
              item.productId ||
              item.product?._id ||
              item.product;
            return pId ? recommendationsAPI.getSimilar(pId, 3) : null;
          })
          .filter(Boolean);

        if (requests.length === 0) return;

        const responses = await Promise.all(requests);
        let allSimilar = [];
        responses.forEach((res) => {
          if (res && res.success) {
            allSimilar = [...allSimilar, ...res.data.products];
          }
        });

        const seen = new Set();
        const cartIds = new Set(
          items.map((item) => {
            const p = item.productId || item.product;
            return p?._id || p?.id || p;
          }),
        );

        const uniqueRecommendations = allSimilar.filter((item) => {
          const id = item._id || item.id;
          if (seen.has(id)) return false;
          if (cartIds.has(id)) return false;
          seen.add(id);
          return true;
        });

        setRecommendations(uniqueRecommendations.slice(0, 8));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, [cartItemIds]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/300x300?text=No+Image";
  };

  const handleAddToCartRecommend = async (e, product) => {
    e.stopPropagation();
    try {
      await dispatch(
        addToCart({
          productId: product._id || product.id,
          quantity: 1,
        }),
      ).unwrap();
      dispatch(fetchCart());
      messageApi.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      messageApi.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    messageApi.success("Đã thêm vào danh sách yêu thích!");
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await dispatch(
        updateCartItem({ itemId, quantity: newQuantity }),
      ).unwrap();
    } catch (error) {
      message.error("Không thể cập nhật số lượng");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      message.warning("Giỏ hàng trống!");
      return;
    }
    navigate("/checkout");
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = item.price || item.productId?.price || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  return (
    <>
      {contextHolder}
      <HomeNavbar />
      <div className="cart-container">
        {loading && items.length === 0 ? (
          <div className="cart-loading">
            <Spin size="large" tip="Đang tải giỏ hàng..." />
          </div>
        ) : (
          <>
            <div className="cart-header">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
                className="back-btn"
              >
                Tiếp tục mua sắm
              </Button>
              <h1 className="cart-title">Giỏ hàng của bạn</h1>
              <p className="cart-subtitle">
                {items.length > 0
                  ? `${items.length} sản phẩm`
                  : "Giỏ hàng trống"}
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
                    onClick={() => navigate("/")}
                    className="shop-now-btn"
                  >
                    Mua sắm ngay
                  </Button>
                </Empty>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-items">
                  {items.map((item) => {
                    const product = item.productId || item.product || {};
                    const price = item.price || product.price || 0;
                    const originalPrice = product.price || 0;
                    const hasDiscount = price < originalPrice;
                    const imageUrl =
                      Array.isArray(product.images) && product.images.length > 0
                        ? typeof product.images[0] === "object"
                          ? product.images[0].imageUrl
                          : product.images[0]
                        : product.image ||
                          "https://placehold.co/150?text=No+Image";

                    const catId =
                      product.categoryId?._id ||
                      product.categoryId?.id ||
                      product.categoryId;
                    const categoryName =
                      categories?.find((c) => c._id === catId || c.id === catId)
                        ?.name ||
                      product.categoryId?.name ||
                      product.category?.name ||
                      "Chưa phân loại";

                    return (
                      <div key={item._id || product._id} className="cart-item">
                        <div
                          className="item-image"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          <img
                            src={imageUrl}
                            alt={product.name}
                            onError={handleImageError}
                          />
                        </div>

                        <div className="item-info">
                          <h3
                            className="item-name"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            {product.name}
                          </h3>
                          <p className="item-category">{categoryName}</p>

                          <div className="item-price">
                            <span className="current-price">
                              {price.toLocaleString("vi-VN")}đ
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="original-price">
                                  {originalPrice.toLocaleString("vi-VN")}đ
                                </span>
                                <span className="discount-badge">
                                  -
                                  {Math.round(
                                    (1 - price / originalPrice) *
                                      100,
                                  )}
                                  %
                                </span>
                              </>
                            )}
                          </div>

                          <div className="item-actions-mobile">
                            <div className="quantity-control">
                              <Button
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1}
                              />
                              <span className="quantity-value">
                                {item.quantity}
                              </span>
                              <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={
                                  item.quantity >= (product.stock || 999)
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="item-quantity">
                          <div className="quantity-control">
                            <Button
                              icon={<MinusOutlined />}
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                            />
                            <InputNumber
                              min={1}
                              max={product.stock || 999}
                              value={item.quantity}
                              onChange={(value) =>
                                handleQuantityChange(item._id, value)
                              }
                              className="quantity-input"
                            />
                            <Button
                              icon={<PlusOutlined />}
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= (product.stock || 999)}
                            />
                            {updatingItems.has(item._id) && (
                              <LoadingOutlined
                                style={{ marginLeft: 8, color: "#1890ff" }}
                              />
                            )}
                          </div>
                        </div>

                        <div className="item-subtotal">
                          <span className="subtotal-label">Tổng:</span>
                          <span className="subtotal-price">
                            {(price * item.quantity).toLocaleString("vi-VN")}đ
                          </span>
                        </div>

                        <div className="item-remove">
                          <Popconfirm
                            title="Xóa sản phẩm"
                            description="Bạn có chắc muốn xóa sản phẩm này?"
                            onConfirm={() => handleRemoveItem(item._id)}
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

                <div className="cart-summary">
                  <div className="summary-card">
                    <h2>Thông tin đơn hàng</h2>
                    <div className="summary-row">
                      <span>Tạm tính ({items.length} sản phẩm):</span>
                      <span>
                        {calculateSubtotal().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Phí vận chuyển:</span>
                      <span className="free-shipping">Miễn phí</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row">
                      <span>Tổng cộng:</span>
                      <span className="total-price">
                        {calculateSubtotal().toLocaleString("vi-VN")}đ
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

            {recommendations.length > 0 && (
              <div
                className="cart-recommendations-section recommendations-section"
                style={{
                  marginTop: "60px",
                  paddingTop: "30px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <h2
                  className="section-title"
                  style={{ fontSize: "24px", marginBottom: "20px" }}
                >
                  Có thể bạn sẽ thích
                </h2>
                <div className="products-grid">
                  {recommendations.map((item) => {
                    const primaryImage =
                      item.images?.find((img) => img.isPrimary) ||
                      item.images?.[0];
                    const imageUrl =
                      primaryImage?.imageUrl ||
                      "https://placehold.co/300x300?text=No+Image";

                    return (
                      <div
                        key={item._id || item.id}
                        className="product-card"
                        onClick={() => handleProductClick(item._id || item.id)}
                      >
                        <div className="product-image-container">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="product-image"
                            onError={handleImageError}
                          />
                          <div className="product-overlay">
                            <button
                              className="product-action-btn"
                              onClick={(e) => handleAddToWishlist(e, item)}
                              title="Thêm vào yêu thích"
                            >
                              <HeartOutlined />
                            </button>
                            <button
                              className="product-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(item._id || item.id);
                              }}
                              title="Xem chi tiết"
                            >
                              <EyeOutlined />
                            </button>
                          </div>
                          {item.stock === 0 && (
                            <div className="product-badge out-of-stock">
                              Hết hàng
                            </div>
                          )}
                        </div>

                        <div className="product-info">
                          <div className="product-category">
                            {item.categoryId?.name ||
                              item.category?.name ||
                              "Chưa phân loại"}
                          </div>
                          <h3 className="product-name" title={item.name}>
                            {item.name}
                          </h3>
                          <p
                            className="product-description"
                            title={
                              item.description
                                ? item.description.replace(/<[^>]+>/g, "")
                                : ""
                            }
                          >
                            {item.description
                              ? item.description.replace(/<[^>]+>/g, "")
                              : "Không có mô tả"}
                          </p>
                          <div className="product-footer">
                            <div className="product-price-container">
                              <span className="product-price">
                                {parseInt(item.price || 0).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </span>
                              {item.originalPrice &&
                                item.originalPrice > item.price && (
                                  <span className="product-original-price">
                                    {parseInt(
                                      item.originalPrice,
                                    ).toLocaleString("vi-VN")}
                                    đ
                                  </span>
                                )}
                            </div>
                            <button
                              className={`add-to-cart-btn ${item.stock === 0 ? "disabled" : ""}`}
                              onClick={(e) => handleAddToCartRecommend(e, item)}
                              disabled={item.stock === 0}
                            >
                              <ShoppingCartOutlined />
                              {item.stock === 0 ? "Hết hàng" : "Thêm"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Cart;

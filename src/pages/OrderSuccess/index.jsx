import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Button, Result, Spin, message } from "antd";
import { useDispatch } from "react-redux";
import { orderAPI, recommendationsAPI } from "../../api";
import { addToCart, fetchCart } from "../../redux/slices/cartSlice";
import HomeNavbar from "../../components/HomeNavbar";
import Footer from "../../components/Footer";
import "../Products/Recommendations.css"; // Reusing recommendations styles
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState(location.state?.orderId || null);
  const [loading, setLoading] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!orderId) {
      fetchLatestOrder();
    }
    fetchTrending();
  }, []);

  const fetchLatestOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll();
      if (res.success && res.data && res.data.length > 0) {
        const sortedOrders = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setOrderId(sortedOrders[0]._id || sortedOrders[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch latest order", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      setLoadingTrending(true);
      const res = await recommendationsAPI.getTrending(6);
      if (res.success && res.data && res.data.products) {
        setTrendingProducts(res.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch trending products", error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await dispatch(
        addToCart({ productId: product._id || product.id, quantity: 1 }),
      ).unwrap();
      dispatch(fetchCart());
      messageApi.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      messageApi.error(error.message || "Lỗi thêm vào giỏ hàng");
    }
  };

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate("/profile");
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/500x500?text=No+Image";
    e.target.onerror = null; // Prevent infinite loop
  };

  return (
    <>
      <HomeNavbar />
      {contextHolder}
      <div className="order-success-container">
        <div className="success-content">
          <Result
            status="success"
            title={<h2 className="success-title">Đặt hàng thành công!</h2>}
            subTitle={
              <p className="success-subtitle">
                Cảm ơn bạn đã mua sắm tại KY-7 Shop. <br />
                Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
              </p>
            }
            extra={[
              <Button
                type="primary"
                key="home"
                icon={<ShoppingOutlined />}
                onClick={() => navigate("/products")}
                size="large"
                className="btn-primary-custom"
              >
                Tiếp tục mua sắm
              </Button>,
              <Button
                key="order"
                icon={<FileTextOutlined />}
                onClick={handleViewOrder}
                size="large"
                loading={loading}
                className="btn-secondary-custom"
              >
                Xem đơn hàng
              </Button>,
            ]}
          />
        </div>

        {/* Section Tiếp tục mua sắm - Trending Recommendations */}
        <section className="recommendations-section trending-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="title-icon">
                  <FireOutlined style={{ color: "#ff4d4f" }} />
                </span>
                Có Thể Bạn Sẽ Thích
              </h2>
              <p className="section-subtitle">
                Gợi ý những sản phẩm đang hot nhất hiện nay
              </p>
            </div>

            {loadingTrending ? (
              <div className="loading-trending">
                <Spin size="large" tip="Đang tải gợi ý..." />
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="products-grid">
                {trendingProducts.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.isPrimary) ||
                    product.images?.[0];
                  const imageUrl =
                    primaryImage?.imageUrl ||
                    "https://placehold.co/500x500?text=No+Image";

                  return (
                    <div
                      key={product._id || product.id}
                      className="product-card"
                      onClick={() =>
                        navigate(`/product/${product._id || product.id}`)
                      }
                    >
                      <div className="product-image-container">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onError={handleImageError}
                        />
                        <div className="product-overlay">
                          <button
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${product._id || product.id}`);
                            }}
                          >
                            <EyeOutlined />
                          </button>
                        </div>
                      </div>
                      <div className="product-info">
                        <div className="product-category">
                          {product.categoryId?.name ||
                            product.category?.name ||
                            "Sản phẩm"}
                        </div>
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-footer">
                          <span className="product-price">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                          <button
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCartOutlined />
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;

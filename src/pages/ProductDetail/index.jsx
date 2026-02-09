import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  InputNumber,
  Breadcrumb,
  Spin,
  message,
  Rate,
  Tabs,
  Card,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCart } from "../../redux/slices/cartSlice";
import axiosInstance from "../../api/axiosConfig";
import HomeNavbar from "../../components/HomeNavbar";
import Footer from "../../components/Footer";
import ProductReviews from "../../components/ProductReviews";
import ProductVouchers from "../../components/ProductVouchers";
import { recommendationsAPI } from "../../api";
import "../Home/Home.css"; // Reuse product card styles
import "../Products/Recommendations.css"; // Reuse section styles
import "./ProductDetail.css";

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
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      console.log("Fetching Product Detail for ID:", id);
      const response = await axiosInstance.get(`/products/${id}`);
      console.log("API Response Data:", response.data?.data);

      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        messageApi.error("Không tìm thấy sản phẩm!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      messageApi.error("Lỗi khi tải thông tin sản phẩm!");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?._id || product?.id) {
      fetchSimilarProducts(product._id || product.id);
    }
  }, [product]);

  const fetchSimilarProducts = async (productId) => {
    try {
      const res = await recommendationsAPI.getSimilar(productId, 6);

      if (res.success) {
        setSimilarProducts(res.data.products);
      }
    } catch (error) {
      console.error("Error fetching similar products:", error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    messageApi.success("Đã thêm sản phẩm vào danh sách yêu thích!");
  };

  const handleAddToCart = async () => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      messageApi.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          quantity: quantity,
        }),
      ).unwrap();

      // Load lại giỏ hàng ngay lập tức để cập nhật số lượng trên Navbar
      dispatch(fetchCart());

      messageApi.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
      messageApi.error("Lỗi khi thêm vào giỏ hàng!");
    }
  };

  const handleBuyNow = () => {
    console.log("Buy Now Clicked");
    const token = localStorage.getItem("token");
    console.log("Current Token:", token);

    if (!token) {
      messageApi.warning("Vui lòng đăng nhập để mua hàng!");
      // Backup redirect to login if needed
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    // Chuyển hướng sang Checkout kèm data sản phẩm (không thêm vào giỏ hàng)
    navigate("/checkout", {
      state: {
        directPurchaseItem: {
          product: product,
          quantity: quantity,
        },
      },
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
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) =>
          typeof img === "object" ? img.imageUrl : img,
        )
      : product.image
        ? [product.image]
        : ["https://via.placeholder.com/600x600?text=No+Image"];

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
                href: "/",
                title: <HomeOutlined />,
              },
              {
                href: "/",
                title: "Sản phẩm",
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
                    className={`thumbnail ${selectedImage === index ? "active" : ""}`}
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

            <div className="product-price">
              {product.salePrice < product.price && (
                <span className="original-price">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              )}
              <span className="current-price">
                {(product.salePrice || product.price).toLocaleString("vi-VN")}đ
              </span>
              {product.salePrice < product.price && (
                <span className="discount-badge">
                  -{Math.round((1 - product.salePrice / product.price) * 100)}%
                </span>
              )}
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Thương hiệu:</span>
                <span className="meta-value">
                  {product.brand || "Đang cập nhật"}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Kho hàng:</span>
                <span className="meta-value stock-status">
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Danh mục:</span>
                <span className="meta-value">
                  {product.categoryId?.name ||
                    product.category?.name ||
                    "Chưa phân loại"}
                </span>
              </div>
            </div>

            {/* Vouchers Section */}
            <ProductVouchers />

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
              ></Button>
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
                key: "1",
                label: "Mô tả sản phẩm",
                children: (
                  <div className="tab-content">
                    <div
                      className="product-description"
                      dangerouslySetInnerHTML={{
                        __html:
                          product.description ||
                          "Đang cập nhật thông tin sản phẩm...",
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "2",
                label: "Đánh giá & Nhận xét",
                children: (
                  <div className="tab-content">
                    <ProductReviews productId={product._id || product.id} />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Related Products */}
        <div className="related-products-section">
          <h2 className="section-title">Sản phẩm tương tự</h2>
          <p className="section-subtitle">
            Các sản phẩm cùng phân khúc và danh mục
          </p>

          {similarProducts.length > 0 ? (
            <div className="products-grid">
              {similarProducts.map((item) => {
                const primaryImage =
                  item.images?.find((img) => img.isPrimary) || item.images?.[0];
                const imageUrl =
                  primaryImage?.imageUrl ||
                  "https://via.placeholder.com/300x300?text=No+Image";

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
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x300?text=No+Image";
                        }}
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
                            {parseInt(item.price || 0).toLocaleString("vi-VN")}đ
                          </span>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <span className="product-original-price">
                                {parseInt(item.originalPrice).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </span>
                            )}
                        </div>

                        <button
                          className={`add-to-cart-btn ${item.stock === 0 ? "disabled" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Using the main handleAddToCart logic but adapted for item
                            // Or simplified add to cart
                            dispatch(
                              addToCart({
                                productId: item._id || item.id,
                                quantity: 1,
                              }),
                            )
                              .unwrap()
                              .then(() => {
                                dispatch(fetchCart());
                                messageApi.success(
                                  `Đã thêm "${item.name}" vào giỏ hàng!`,
                                );
                              })
                              .catch((err) =>
                                messageApi.error("Lỗi thêm vào giỏ hàng"),
                              );
                          }}
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
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f9f9f9",
                borderRadius: "8px",
                margin: "20px 0",
              }}
            >
              <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
                ⚠️ Hiện chưa có sản phẩm tương tự nào.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;

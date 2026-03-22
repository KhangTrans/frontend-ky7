import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
    Layout, Typography, Button, Row, Col, 
    Card, Tag, Badge, Empty, Spin, message, Divider, Space 
} from 'antd';
import { 
    ShoppingOutlined, ArrowLeftOutlined, 
    ClockCircleOutlined, PercentageOutlined,
    TagOutlined
} from '@ant-design/icons';
import { bannerAPI } from '../../api';
import { addToCart, fetchCart } from '../../redux/slices/cartSlice';
import HomeNavbar from '../../components/HomeNavbar';
import dayjs from 'dayjs';
import './Promotion.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Promotion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState({});

    const fetchBannerDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await bannerAPI.getById(id);
            if (res.success) {
                setBanner(res.data);
            } else {
                message.error('Không tìm thấy chương trình khuyến mãi');
                navigate('/products');
            }
        } catch (error) {
            console.error('Failed to fetch promotion:', error);
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchBannerDetails();
        window.scrollTo(0, 0);
    }, [fetchBannerDetails]);

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [product._id]: true }));
            await dispatch(addToCart({ 
                productId: product._id, 
                quantity: 1 
            })).unwrap();
            
            // Cập nhật số lượng giỏ hàng trên Navbar
            dispatch(fetchCart());
            
            message.success(`Đã thêm ${product.name} vào giỏ hàng`);
        } catch (error) {
            message.error(error || 'Không thể thêm vào giỏ hàng');
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false }));
        }
    };

    if (loading) {
        return (
            <div className="promotion-loading">
                <Spin size="large" tip="Đang tải chương trình khuyến mãi..." />
            </div>
        );
    }

    if (!banner) return null;

    return (
        <div className="promotion-page">
            <HomeNavbar />
            
            {/* Promotion Hero */}
            <div 
                className="promotion-hero" 
                style={{ backgroundImage: `url(${banner.imageUrl})` }}
            >
                <div className="promotion-hero-overlay">
                    <div className="promotion-hero-content">
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate(-1)}
                            className="back-btn"
                        >
                            Quay lại
                        </Button>
                        
                        <div className="promo-glass-card">
                            <Tag color="#f50" className="promo-badge">
                                <PercentageOutlined /> GIẢM GIÁ {banner.discountPercent}%
                            </Tag>
                            <Title level={1} className="promo-title">{banner.title}</Title>
                            <Paragraph className="promo-desc">
                                {banner.description || 'Chương trình ưu đãi đặc biệt dành cho các sản phẩm trong danh sách này.'}
                            </Paragraph>
                            
                            <Space size="large" className="promo-info">
                                <span className="info-item">
                                    <ClockCircleOutlined /> Thời hạn: {dayjs(banner.startDate).format('DD/MM/YYYY')} - {dayjs(banner.endDate).format('DD/MM/YYYY')}
                                </span>
                                <span className="info-item">
                                    <TagOutlined /> {banner.products?.length || 0} Sản phẩm
                                </span>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>

            <Content className="promotion-content container">
                <div className="section-header">
                    <Title level={2}>Danh sách sản phẩm ưu đãi</Title>
                    <Divider orientation="left" plain>
                        <Tag color="red">DEAL HỜI</Tag>
                    </Divider>
                </div>

                {banner.products && banner.products.length > 0 ? (
                    <Row gutter={[24, 24]} className="promo-products-grid">
                        {banner.products.map(product => {
                            const discountedPrice = product.price * (1 - banner.discountPercent / 100);
                            return (
                                <Col xs={12} sm={12} md={8} lg={6} key={product._id}>
                                    <Card
                                        hoverable
                                        className="promo-product-card"
                                        cover={
                                            <div className="product-image-box" onClick={() => navigate(`/product/${product._id}`)}>
                                                <img src={product.imageUrl} alt={product.name} />
                                                <div className="discount-tag">-{banner.discountPercent}%</div>
                                            </div>
                                        }
                                    >
                                        <div className="product-meta" onClick={() => navigate(`/product/${product._id}`)}>
                                            <Text type="secondary" className="product-brand">{product.brand || 'Thương hiệu'}</Text>
                                            <Title level={5} className="product-name" ellipsis={{ rows: 2 }}>
                                                {product.name}
                                            </Title>
                                            <div className="price-box">
                                                <Text className="current-price">
                                                    {discountedPrice.toLocaleString()}đ
                                                </Text>
                                                <Text delete className="original-price">
                                                    {product.price?.toLocaleString()}đ
                                                </Text>
                                            </div>
                                        </div>
                                        <Button 
                                            type="primary" 
                                            block 
                                            icon={<ShoppingOutlined />}
                                            onClick={() => handleAddToCart(product)}
                                            loading={addingToCart[product._id]}
                                            className="add-to-cart-btn"
                                        >
                                            Thêm giỏ hàng
                                        </Button>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <Empty 
                        description="Hiện chưa có sản phẩm nào cho chương trình này" 
                        style={{ padding: '60px 0' }}
                    />
                )}
            </Content>
        </div>
    );
};

export default Promotion;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Table, Tag, Row, Col, Spin, message, Descriptions, Divider, Steps } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, ShoppingOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import HomeNavbar from '../../components/HomeNavbar';
import './OrderDetail.css';

const { Step } = Steps;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        message.error('Không tìm thấy đơn hàng!');
        navigate('/profile'); // Hoặc trang danh sách đơn hàng
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      message.error('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'shipping': return 'cyan';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  // Cột cho bảng sản phẩm
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'product',
      render: (product, record) => {
        const productData = record.productId || {};
        
        let imgUrl = '';
        if (Array.isArray(productData.images) && productData.images.length > 0) {
             const firstImg = productData.images[0];
             imgUrl = (typeof firstImg === 'object' && firstImg?.imageUrl) ? firstImg.imageUrl : firstImg;
        }
        
        if (!imgUrl) {
             imgUrl = productData.image || record.productImage || 'https://via.placeholder.com/60';
        }
        const name = productData.name || record.productName || 'Sản phẩm';

        return (
          <div className="product-cell">
            <img src={imgUrl} alt={name} className="product-img" />
            <div className="product-info">
              <h4>{name}</h4>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Tạm tính',
      key: 'subtotal',
      render: (_, record) => {
        const subtotal = (record.price || 0) * (record.quantity || 1);
        return <b style={{ color: '#1677ff' }}>{subtotal.toLocaleString('vi-VN')}đ</b>;
      },
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '40px' }}>
      <HomeNavbar />
      
      <div className="order-detail-container">
        {/* Header Actions */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          {/* <Button icon={<PrinterOutlined />}>In hóa đơn</Button> */}
        </div>

        {/* Title & Status */}
        <Card className="section-card">
          <Row justify="space-between" align="middle">
            <Col>
              <h2 className="page-title">Đơn hàng #{order.orderNumber}</h2>
              <span className="order-meta">
                Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </Col>
            <Col>
              <Tag color={getStatusColor(order.orderStatus)} style={{ fontSize: '16px', padding: '6px 12px' }}>
                {getStatusText(order.orderStatus).toUpperCase()}
              </Tag>
            </Col>
          </Row>
          
           {/* Timeline đơn giản (Optional) */}
           <div style={{ marginTop: 30 }}>
              <Steps 
                current={
                  ['pending', 'processing', 'shipping', 'completed'].indexOf(order.orderStatus?.toLowerCase())
                }
                status={order.orderStatus?.toLowerCase() === 'cancelled' ? 'error' : 'process'}
              >
                  <Step title="Đặt hàng" description="Đơn hàng đã được tạo" />
                  <Step title="Xác nhận" description="Người bán đang chuẩn bị" />
                  <Step title="Vận chuyển" description="Đang giao đến bạn" />
                  <Step title="Hoàn thành" description="Giao hàng thành công" />
              </Steps>
           </div>
        </Card>

        <Row gutter={24}>
          <Col xs={24} md={16}>
             {/* Product List */}
             <Card className="section-card" title={<><ShoppingOutlined /> Danh sách sản phẩm</>}>
                <Table 
                  dataSource={order.items || []} 
                  columns={columns} 
                  pagination={false} 
                  rowKey={(record) => record._id || record.productId._id} // Fallback key
                />
                
                <div className="order-summary">
                  <div className="summary-content">
                     {/* Nếu có phí ship, thêm dòng ở đây */}
                     {/* <div className="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span className="value">30.000đ</span>
                     </div> */}
                     <div className="summary-row total">
                        <span>Tổng tiền:</span>
                        <span className="value">{order.total?.toLocaleString('vi-VN')}đ</span>
                     </div>
                  </div>
                </div>
             </Card>
          </Col>
          
          <Col xs={24} md={8}>
            {/* Payment & Shipping Info */}
            <Card className="section-card" title="Thông tin thanh toán">
               <Descriptions column={1} layout="vertical">
                 <Descriptions.Item label="Phương thức thanh toán">
                    <Tag color="blue">{order.paymentMethod?.toUpperCase() || 'COD'}</Tag>
                 </Descriptions.Item>
                 <Descriptions.Item label="Trạng thái thanh toán">
                     <Tag color={order.paymentStatus === 'paid' ? 'green' : 'orange'}>
                        {order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                     </Tag>
                 </Descriptions.Item>
               </Descriptions>
            </Card>

            <Card className="section-card" title="Địa chỉ nhận hàng">
               <Descriptions column={1}>
                  <Descriptions.Item label="Họ tên">
                     {order.shippingAddress?.fullName || order.customerName || '---'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                     {order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.customerPhone || '---'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                     {(() => {
                        const addr = order.shippingAddress;
                        // Case 1: shippingAddress is an object (populated or structured)
                        if (typeof addr === 'object' && addr !== null) {
                            return `${addr.address || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.city || ''}`;
                        }
                        // Case 2: Flat fields from order root (if backend stores them flat)
                        if (order.shippingWard || order.shippingCity) {
                             return `${order.shippingAddress || order.address || ''}, ${order.shippingWard || ''}, ${order.shippingDistrict || ''}, ${order.shippingCity || ''}`;
                        }
                        // Case 3: Simple string or fallback
                        return addr || order.address || '---';
                     })()}
                  </Descriptions.Item>
               </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OrderDetail;

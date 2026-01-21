import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Table, Tag, Row, Col, Spin, message, Descriptions, Divider, Steps, Popover, Input, Modal, Form } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, ShoppingOutlined, EnvironmentOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import { addressAPI } from '../../api';
import HomeNavbar from '../../components/HomeNavbar';
import AddressSelectionModal from '../../components/AddressSelectionModal';
import AddressFormModal from '../../components/AddressFormModal';
import './OrderDetail.css';

const { Step } = Steps;
const { TextArea } = Input;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Address Management
  const [userAddresses, setUserAddresses] = useState([]);
  const [isAddressListOpen, setIsAddressListOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState(null);
  const [addressForm] = Form.useForm();
  
  // Note Editing
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    fetchOrderDetail();
    fetchUserAddresses();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
        setTempNote(response.data.data.shippingNote || '');
      } else {
        message.error('Không tìm thấy đơn hàng!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      message.error('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
      try {
          const res = await addressAPI.getAll();
          if (res.success) {
              setUserAddresses(res.data);
          }
      } catch (error) {
          console.error("Fetch addresses error", error);
      }
  };

  // Update Order with Selected Address
  const handleAddressSelect = async () => {
      const selectedAddr = userAddresses.find(a => a._id === tempSelectedAddressId);
      if (!selectedAddr) {
          setIsAddressListOpen(false);
          return;
      }
      
      await updateOrderInfo({
          ...selectedAddr, // This contains city, district, ward, address, fullName, phoneNumber
          // Map to payload fields if needed
          customerName: selectedAddr.fullName,
          customerPhone: selectedAddr.phoneNumber,
          shippingNote: order.shippingNote // Keep existing note
      });
      setIsAddressListOpen(false);
  };

  const handleUpdateNote = async () => {
      await updateOrderInfo({
          customerName: order.shippingAddress?.fullName || order.customerName,
          customerPhone: order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.customerPhone,
          shippingAddress: order.shippingAddress, // Keep existing address obj/string
          city: order.shippingCity, // Fallback fields
          shippingNote: tempNote
      }, true); // isNoteUpdate
      setIsEditingNote(false);
  };

  const updateOrderInfo = async (data, isNoteUpdate = false) => {
      try {
          setUpdating(true);
          
          let fullAddressString = "";
          let addressComponents = {};

          if (!isNoteUpdate) {
             // If data is from Address Book, it has structured fields
             fullAddressString = `${data.address}, ${data.ward}, ${data.district}, ${data.city}`;
             addressComponents = {
                 address: data.address,
                 city: data.city,
                 district: data.district,
                 ward: data.ward
             };
          } else {
             // If just updating note, try to preserve existing address
             // If shippingAddress is string, keep it. If object, flatten it.
             const currentAddr = order.shippingAddress;
             if (typeof currentAddr === 'object' && currentAddr) {
                 fullAddressString = `${currentAddr.address}, ${currentAddr.ward}, ${currentAddr.district}, ${currentAddr.city}`;
                 addressComponents = {
                     address: currentAddr.address,
                     city: currentAddr.city,
                     district: currentAddr.district,
                     ward: currentAddr.ward
                 };
             } else {
                 fullAddressString = currentAddr || order.address;
             }
          }

          const payload = {
              customerName: data.customerName || data.fullName,
              customerPhone: data.customerPhone || data.phoneNumber,
              shippingNote: isNoteUpdate ? data.shippingNote : order.shippingNote,
              shippingAddress: fullAddressString,
              ...addressComponents
          };

          const response = await axiosInstance.put(`/orders/${id}/info`, payload);
          
          if (response.data.success) {
              message.success('Cập nhật thành công!');
              // Optimistic Update
              setOrder(prev => ({
                  ...prev,
                  customerName: payload.customerName,
                  customerPhone: payload.customerPhone,
                  shippingNote: payload.shippingNote,
                  shippingAddress: !isNoteUpdate ? {
                      fullName: payload.customerName,
                      phoneNumber: payload.customerPhone,
                      ...addressComponents
                  } : prev.shippingAddress
              }));
              // Refresh addresses in case logic depends on it
              fetchUserAddresses();
          } else {
              message.error(response.data.message || 'Cập nhật thất bại');
          }
      } catch (error) {
          console.error(error);
          message.error('Lỗi cập nhật: ' + error.message);
      } finally {
          setUpdating(false);
      }
  };

  const handleAddNewAddress = async (values) => {
      try {
          const res = await addressAPI.create(values);
          if (res.success || res.status === 201) {
              message.success('Thêm địa chỉ thành công');
              setIsAddAddressOpen(false);
              addressForm.resetFields();
              fetchUserAddresses();
          }
      } catch (error) {
          message.error('Thêm địa chỉ thất bại');
      }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'confirmed': return 'purple';
      case 'shipping': return 'cyan';
      case 'delivered': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  const getStepStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'cancelled') return 'error';
    if (s === 'delivered' || s === 'completed') return 'finish';
    return 'process';
  };

  const getStepCurrent = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending': return 0;
      case 'confirmed': 
      case 'processing': return 1;
      case 'shipping': return 2;
      case 'delivered': 
      case 'completed': return 3;
      default: return 0;
    }
  };

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}>
            Quay lại danh sách
          </Button>
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
          
           {/* Timeline đơn giản */}
           <div style={{ marginTop: 30 }}>
              <Steps 
                current={getStepCurrent(order.orderStatus)}
                status={getStepStatus(order.orderStatus)}
              >
                  <Step title="Đặt hàng" description="Đơn hàng đã được tạo" />
                  <Step title="Xử lý" description="Người bán đang chuẩn bị" />
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
                  rowKey={(record) => record._id || record.productId._id} 
                />
                
                <div className="order-summary">
                  <div className="summary-content">
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

            <Card 
                className="section-card" 
                title={<span><EnvironmentOutlined /> Địa chỉ nhận hàng</span>}
                extra={order.orderStatus === 'pending' && <Button type="link" onClick={() => setIsAddressListOpen(true)}>THAY ĐỔI</Button>}
            >
               {/* Checkout-style Address Display */}
               <div className="shipping-info-display">
                    <div style={{ marginBottom: 8 }}>
                        <strong style={{ fontSize: 16, marginRight: 8 }}>
                            {order.shippingAddress?.fullName || order.customerName || '---'}
                        </strong>
                        <span style={{ color: '#666' }}>
                             | {order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.customerPhone || '---'}
                        </span>
                    </div>
                    <div style={{ color: '#555', marginBottom: 16 }}>
                         {(() => {
                            const addr = order.shippingAddress;
                            if (typeof addr === 'object' && addr !== null) {
                                return `${addr.address || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.city || ''}`;
                            }
                            return addr || order.address || '---';
                         })()}
                    </div>
                    
                    <Divider dashed style={{ margin: '12px 0' }} />
                    
                    {/* Note Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                            <span style={{ color: '#888', fontSize: 13 }}>Ghi chú:</span>
                            {isEditingNote ? (
                                <div style={{ marginTop: 4 }}>
                                    <TextArea 
                                        rows={2} 
                                        value={tempNote} 
                                        onChange={(e) => setTempNote(e.target.value)} 
                                        style={{ marginBottom: 8 }}
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Button size="small" style={{ marginRight: 8 }} onClick={() => setIsEditingNote(false)}>Hủy</Button>
                                        <Button type="primary" size="small" onClick={handleUpdateNote} loading={updating}>Lưu</Button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ margin: 0 }}>{order.shippingNote || 'Không có ghi chú'}</p>
                            )}
                        </div>
                        {!isEditingNote && order.orderStatus === 'pending' && (
                            <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditingNote(true)} />
                        )}
                    </div>
               </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Address Selection Modal */}
      <AddressSelectionModal 
          visible={isAddressListOpen}
          onCancel={() => setIsAddressListOpen(false)}
          onOk={handleAddressSelect}
          addresses={userAddresses}
          selectedId={tempSelectedAddressId}
          onChange={setTempSelectedAddressId}
          onAddNew={() => setIsAddAddressOpen(true)}
          // Disable delete in this context if desired, or handle it
          onDelete={async (id) => {
              await addressAPI.delete(id);
              fetchUserAddresses();
              message.success('Đã xóa địa chỉ');
          }}
      />

      {/* Add New Address Modal */}
      <AddressFormModal 
          visible={isAddAddressOpen}
          onCancel={() => setIsAddAddressOpen(false)}
          onSuccess={handleAddNewAddress}
          form={addressForm}
      />
    </div>
  );
};

export default OrderDetail;

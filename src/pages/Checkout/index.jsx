import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Form, 
  Input, 
  Button, 
  Radio, 
  Space, 
  Divider, 
  message, 
  Card,
  Modal,
  Tag,
  Row,
  Col,
  List,
  Popconfirm,
  InputNumber
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusOutlined
} from '@ant-design/icons';
import HomeNavbar from '../../components/HomeNavbar';
import axiosInstance from '../../api/axiosConfig';
import { addressAPI, orderAPI, paymentAPI } from '../../api';
import { clearCart, updateCartItem } from '../../redux/slices/cartSlice';
import './Checkout.css';

const { TextArea } = Input;

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm(); // Main form (Note/Payment)
  const [addressForm] = Form.useForm(); // Add address form
  
  const location = useLocation();
  // State for direct purchase item to allow quantity updates locally
  const [localDirectItem, setLocalDirectItem] = useState(location.state?.directPurchaseItem || null);

  // Get cart data from Redux if not direct purchase
  const { items: cartItems, totalQuantity } = useSelector((state) => state.cart);
  
  // Determine items to show/checkout
  const items = localDirectItem 
    ? [{ 
        productId: localDirectItem.product, 
        quantity: localDirectItem.quantity,
        _id: 'direct_item',
        isDirect: true
      }]
    : cartItems;
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  
  // Address State
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isAddAddressModalVisible, setIsAddAddressModalVisible] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState(null); // For selection in modal

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const res = await addressAPI.getAll();
      if (res.success) {
        const addresses = res.data;
        setUserAddresses(addresses);
        
        // If no address currently selected, select default one
        if (!selectedAddress && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          setSelectedAddress(defaultAddr);
        } else if (selectedAddress) {
            // Update selected address object if it was updated in list
            const updated = addresses.find(a => a._id === selectedAddress._id);
            if (updated) setSelectedAddress(updated);
             // If selected address was deleted, revert to default
            else {
                const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                setSelectedAddress(defaultAddr || null);
            }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }

    // Only redirect if cart is empty AND not a direct buy
    if (items.length === 0 && !location.state?.directPurchaseItem) {
      message.warning('Giỏ hàng trống! Vui lòng mua sắm thêm.');
      navigate('/');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, items, navigate, location.state]);

  // Version Check
  useEffect(() => {
     console.log('Checkout Component Mounted - Version: FIX_ITEMS_PAYLOAD');
  }, []);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const product = item.productId || item.product || {};
      const price = product.salePrice || product.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const finalTotal = calculateSubtotal();

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Address Management Handlers
  const showAddressModal = () => {
    setTempSelectedAddressId(selectedAddress?._id);
    setIsAddressModalVisible(true);
  };

  const handleAddressModalOk = () => {
    const newSelected = userAddresses.find(a => a._id === tempSelectedAddressId);
    if (newSelected) {
      setSelectedAddress(newSelected);
    }
    setIsAddressModalVisible(false);
  };

  const handleQuantityChange = (itemId, productId, newQuantity, isDirect) => {
    if (newQuantity < 1) return;

    if (isDirect) {
      setLocalDirectItem(prev => ({
        ...prev,
        quantity: newQuantity
      }));
    } else {
      // For cart items, use itemId (item._id) as required by new API: PUT /api/cart/:itemId
      dispatch(updateCartItem({ itemId: itemId, quantity: newQuantity }));
    }
  };

  const handleAddNewAddress = async (values) => {
    try {
      const newAddrData = {
        ...values,
        isDefault: userAddresses.length === 0 // First address is default
      };
      await addressAPI.create(newAddrData);
      message.success('Thêm địa chỉ thành công!');
      setIsAddAddressModalVisible(false);
      addressForm.resetFields();
      await fetchAddresses(); // Refresh list
    } catch (error) {
      message.error('Thêm địa chỉ thất bại.');
    }
  };

  const handleDeleteAddress = async (id, isDefault) => {
    if (isDefault) {
      message.warning('Không thể xóa địa chỉ mặc định!');
      return;
    }
    try {
      await addressAPI.delete(id);
      message.success('Đã xóa địa chỉ!');
      await fetchAddresses();
    } catch (error) {
      message.error('Xóa địa chỉ thất bại.');
    }
  };

  const onFinish = async (values) => {
    if (!selectedAddress) {
      message.error('Vui lòng thêm địa chỉ giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = `${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`;
      
      let response;
      
      // CASE 1: Direct Buy Now (API riêng theo yêu cầu)
      if (localDirectItem) {
        const buyNowPayload = {
          productId: localDirectItem.product._id,
          quantity: localDirectItem.quantity, // Use updated quantity
          customerName: selectedAddress.fullName,
          customerEmail: user?.email || 'email@example.com',
          customerPhone: selectedAddress.phoneNumber,
          shippingAddress: selectedAddress.address,
          shippingCity: selectedAddress.city,
          shippingDistrict: selectedAddress.district,
          shippingWard: selectedAddress.ward,
          shippingWard: selectedAddress.ward,
          shippingNote: values.note || '',
          paymentMethod: paymentMethod,
          voucherCode: '' // Hiện tại chưa có voucher input
        };
        console.log('Sending Buy Now Payload:', buyNowPayload);
        // Call direct API endpoint
        const res = await axiosInstance.post('/orders/buy-now', buyNowPayload);
        response = res.data; // axios returns { data: ... }
      } 
      // CASE 2: Regular Cart Checkout
      else {
        const orderData = {
          // Changed from 'orderItems' to 'items' to match Backend Schema/Usage
          items: items.map(item => ({
            productId: item.productId?._id || item.product?._id,
            name: item.productId?.name || item.product?.name || 'Sản phẩm',
            image: item.productId?.images?.[0] || item.productId?.image || '',
            quantity: item.quantity,
            price: item.productId?.salePrice || item.productId?.price || 0
          })).filter(i => i.productId),
          totalPrice: finalTotal,
          itemsPrice: finalTotal,
          shippingPrice: 0,
          paymentMethod: paymentMethod,
          
          customerName: selectedAddress.fullName,
          customerEmail: user?.email || 'test@example.com',
          customerPhone: selectedAddress.phoneNumber,
          shippingAddress: selectedAddress.address, 
          shippingCity: selectedAddress.city,
          shippingDistrict: selectedAddress.district,
          shippingWard: selectedAddress.ward,
          shippingNote: values.note || '',            
          
          shippingDetails: {
             address: selectedAddress.address,
             ward: selectedAddress.ward,
             district: selectedAddress.district,
             city: selectedAddress.city
          }
        };

        console.log('Sending Order Data (Final - V2 Fixed):', JSON.stringify(orderData, null, 2));
        response = await orderAPI.create(orderData);
      }
      console.log('Order Response:', response);

      if (response && response.success) {
        // Backend trả về: { success: true, data: orderObj }
        const orderId = response.data?._id || response.data?.id; 
        
        let shouldRedirectToSuccess = true;

        if (paymentMethod === 'vnpay' || paymentMethod === 'zalopay') {
           try {
              let paymentRedirectUrl = null;
              
              if (paymentMethod === 'vnpay') {
                message.loading('Đang kết nối VNPay...', 1);
                try {
                    const vnpayRes = await paymentAPI.createVNPayUrl(finalTotal, orderId);
                    if (vnpayRes.success && vnpayRes.data) paymentRedirectUrl = vnpayRes.data.paymentUrl;
                } catch (err) {
                    // Nếu lỗi 404, thử endpoint khác (fallback)
                    if (err.response?.status === 404) {
                        console.log('Backend Payment API not found (404). Redirecting to VNPay Sandbox TryItNow...');
                        // Chuyển hướng thẳng sang trang Sandbox của VNPay (như yêu cầu)
                        // User sẽ phải tự nhập thông tin vì đây là trang demo chung
                        paymentRedirectUrl = 'https://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder'; 
                        message.info('Đang chuyển hướng đến VNPay Sandbox...');
                    } else throw err;
                }
              } else if (paymentMethod === 'zalopay') {
                message.loading('Đang kết nối ZaloPay...', 1);
                try {
                    const zalopayRes = await paymentAPI.createZaloPayUrl(finalTotal, orderId);
                    if (zalopayRes.success && zalopayRes.data) paymentRedirectUrl = zalopayRes.data.order_url;
                } catch (err) {
                     console.log('Payment API Error Status:', err.response?.status);
                     // Fallback to Mock Payment if API fails (404, 500, or 400 Bad Request)
                     // Re-enabled for 400 to allow testing flow despite Backend ZaloPay config errors
                     if (!err.response || [400, 404, 500].includes(err.response?.status)) {
                        console.log('Backend Payment API failed. Using INTERNAL MOCK...');
                        const params = new URLSearchParams({
                            amount: finalTotal,
                            orderId: orderId,
                            method: 'zalopay'
                        });
                        paymentRedirectUrl = `/mock-payment?${params.toString()}`;
                        message.info('Chuyển hướng đến cổng thanh toán giả lập...');
                    } else throw err;
                }
              }

              if (paymentRedirectUrl) {
                   shouldRedirectToSuccess = false;
                   window.location.href = paymentRedirectUrl;
                   return; 
              } else {
                  throw new Error('Không nhận được link thanh toán từ hệ thống');
              }
           } catch (paymentError) {
              console.error('Payment Error:', paymentError);
              const status = paymentError.response?.status;
              const serverMsg = paymentError.response?.data?.message || paymentError.message;
              message.warning(`Lỗi thanh toán (${status || 'Unknown'}): ${serverMsg}`);
           }
        }
        
        if (shouldRedirectToSuccess) {
            message.success('Đặt hàng thành công!');
            dispatch(clearCart());
            navigate('/order-success', { state: { orderId: orderId } });
        }

      } else {
         message.error('Đặt hàng thất bại: ' + (response.message || 'Lỗi không xác định'));
      }

    } catch (error) {
      console.error('Place order error:', error);
      console.log('Failed Request URL:', error.config?.url);
      console.log('Failed Request BaseURL:', error.config?.baseURL);
      
      const errorMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : '') || error.message || 'Đặt hàng thất bại.';
      message.error(`${errorMsg} (API: ${error.config?.url})`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <>
      <HomeNavbar />
      <div className="checkout-container">
        <div className="checkout-header">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/cart')}
            className="back-link"
          >
            Quay lại giỏ hàng
          </Button>
          <h1>Thanh toán</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="checkout-form"
            >
              {/* Shipping Information - NEW UI */}
              <Card 
                title={<span><EnvironmentOutlined /> Địa chỉ nhận hàng</span>} 
                className="checkout-card" 
                bordered={false}
              >
                {selectedAddress ? (
                  <div className="selected-address-box">
                    <div className="address-details">
                       <h4>{selectedAddress.fullName} <Divider type="vertical" /> {selectedAddress.phoneNumber}</h4>
                       <p>{selectedAddress.address}</p>
                       <p>{selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}</p>
                       {selectedAddress.isDefault && <Tag color="red" style={{marginTop: 8}}>Mặc định</Tag>}
                    </div>
                    <Button type="link" onClick={showAddressModal} className="change-address-btn">
                      THAY ĐỔI
                    </Button>
                  </div>
                ) : (
                  <div className="empty-address-box">
                    <p>Bạn chưa có địa chỉ nhận hàng.</p>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddAddressModalVisible(true)}>
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                )}

                <Divider style={{margin: '12px 0'}} />
                
                <Form.Item name="note" label="Ghi chú đơn hàng (Tùy chọn)" style={{marginBottom: 0}}>
                  <TextArea placeholder="Lời nhắn cho người bán hoặc shipper..." rows={1} />
                </Form.Item>
              </Card>

              {/* Payment Method */}
              <Card title="💳 Phương thức thanh toán" className="checkout-card mt-20" bordered={false}>
                <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod} className="payment-radio-group">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="cod" className="payment-radio">
                      <div className="payment-option">
                        <div className="payment-icon cod-icon">💵</div>
                        <div className="payment-info">
                          <span className="payment-name">Thanh toán khi nhận hàng (COD)</span>
                          <span className="payment-desc">Thanh toán tiền mặt cho shipper khi nhận hàng</span>
                        </div>
                      </div>
                    </Radio>
                    <Radio value="vnpay" className="payment-radio">
                      <div className="payment-option">
                        <div className="payment-icon vnpay-icon">
                          <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" />
                        </div>
                        <div className="payment-info">
                          <span className="payment-name">Thanh toán qua VNPAY</span>
                          <span className="payment-desc">Quét mã QR qua ứng dụng ngân hàng</span>
                        </div>
                      </div>
                    </Radio>
                    <Radio value="zalopay" className="payment-radio">
                      <div className="payment-option">
                        <div className="payment-icon zalopay-icon">
                          <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" />
                        </div>
                        <div className="payment-info">
                          <span className="payment-name">Thanh toán qua ZaloPay</span>
                          <span className="payment-desc">Thanh toán nhanh qua ví ZaloPay</span>
                        </div>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Card>
            </Form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-section">
            <Card title="🛒 Đơn hàng của bạn" className="summary-card" bordered={false}>
              <div className="order-items">
                {items.map((item) => {
                  const product = item.productId || item.product || {};
                  const price = product.salePrice || product.price || 0;
                  let imageUrl = '';
                  if (Array.isArray(product.images) && product.images.length > 0) {
                      const firstImg = product.images[0];
                      imageUrl = (typeof firstImg === 'object' && firstImg?.imageUrl) ? firstImg.imageUrl : firstImg;
                  } else {
                      imageUrl = product.image || '';
                  }


                  return (
                    <div key={item._id || product._id} className="order-item">
                      <div className="order-item-image">
                        <img src={imageUrl} alt={product.name} />
                        <span className="item-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="order-item-info">
                        <h4 className="order-item-name">{product.name}</h4>
                        <p className="order-item-price">{price.toLocaleString('vi-VN')}đ</p>
                        <div className="order-item-qty-control" style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                           <span style={{ marginRight: 8, fontSize: 13, color: '#666' }}>Số lượng:</span>
                           <Button 
                             size="small" 
                             icon={<MinusOutlined />} 
                             onClick={() => handleQuantityChange(item._id, product._id, item.quantity - 1, !!item.isDirect)}
                             disabled={item.quantity <= 1}
                           />
                           <InputNumber 
                              min={1} 
                              max={product.stock || 100} 
                              value={item.quantity} 
                              size="small"
                              controls={false}
                              style={{ width: '40px', margin: '0 4px', textAlign: 'center' }}
                              onChange={(val) => handleQuantityChange(
                                item._id, 
                                product._id, 
                                val, 
                                !!item.isDirect
                              )}
                           />
                           <Button 
                             size="small" 
                             icon={<PlusOutlined />} 
                             onClick={() => handleQuantityChange(item._id, product._id, item.quantity + 1, !!item.isDirect)}
                             disabled={item.quantity >= (product.stock || 100)}
                           />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Divider />

              <div className="price-row">
                <span>Tạm tính</span>
                <span>{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="price-row">
                <span>Phí vận chuyển</span>
                <span className="free-ship-text">Miễn phí</span>
              </div>

              <Divider />

              <div className="price-row total-row">
                <span>Tổng cộng</span>
                <span className="total-amount">{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <Button 
                type="primary" 
                size="large" 
                block 
                className="place-order-btn"
                loading={submitting}
                onClick={() => form.submit()}
              >
                ĐẶT HÀNG
              </Button>
              
              <div className="security-note">
                <CheckCircleOutlined /> Bảo mật thanh toán 100%
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL: Select Address */}
      <Modal
        title="Địa chỉ của tôi"
        open={isAddressModalVisible}
        onOk={handleAddressModalOk}
        onCancel={() => setIsAddressModalVisible(false)}
        width={600}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Radio.Group onChange={(e) => setTempSelectedAddressId(e.target.value)} value={tempSelectedAddressId} style={{width: '100%'}}>
            <List
                itemLayout="horizontal"
                dataSource={userAddresses}
                renderItem={(item) => (
                    <div className={`address-item ${item._id === tempSelectedAddressId ? 'selected' : ''}`}>
                        <Radio value={item._id} style={{alignSelf: 'flex-start', marginTop: 4}} />
                        <div className="address-content">
                            <div className="address-header">
                                <span className="address-name">{item.fullName}</span>
                                <span className="address-phone">{item.phoneNumber}</span>
                                {item.isDefault && <Tag color="red">Mặc định</Tag>}
                            </div>
                            <span className="address-text">{item.address}</span>
                            <span className="address-text">{item.ward}, {item.district}, {item.city}</span>
                            
                            {!item.isDefault && (
                                <div className="address-actions">
                                    <Popconfirm
                                        title="Xóa địa chỉ này?"
                                        onConfirm={() => handleDeleteAddress(item._id, item.isDefault)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button type="link" danger size="small" className="delete-address-btn">Xóa</Button>
                                    </Popconfirm>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />
            </Radio.Group>
            
            <Button 
                type="dashed" 
                block 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddAddressModalVisible(true)}
                className="add-new-address-btn"
                size="large"
            >
                Thêm địa chỉ mới
            </Button>
        </div>
      </Modal>

      {/* MODAL: Add New Address */}
      <Modal
        title="Thêm địa chỉ mới"
        open={isAddAddressModalVisible}
        onOk={() => addressForm.submit()}
        onCancel={() => setIsAddAddressModalVisible(false)}
        okText="Hoàn thành"
        cancelText="Trở lại"
      >
        <Form form={addressForm} layout="vertical" onFinish={handleAddNewAddress}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT!' }, { pattern: /^[0-9]{10}$/, message: 'SĐT sai định dạng!' }]}>
                        <Input placeholder="09xxx" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                     <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true }]}>
                        <Input placeholder="TP.HCM" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                        <Input placeholder="Quận 1" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                        <Input placeholder="Bến Nghé" />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
                <TextArea rows={2} placeholder="Số nhà, tên đường..." />
            </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Checkout;

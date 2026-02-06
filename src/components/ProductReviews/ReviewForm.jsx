import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Rate, message, Card, Alert } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../../api';

const { TextArea } = Input;

const ReviewForm = ({ productId, onSuccess }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Permission state
  const [canReview, setCanReview] = useState(true);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [checkingPermission, setCheckingPermission] = useState(false);

  useEffect(() => {
    if (isAuthenticated && productId) {
      checkEligibility();
    }
  }, [isAuthenticated, productId]);

  const checkEligibility = async () => {
    try {
      setCheckingPermission(true);
      const res = await reviewAPI.checkPermission(productId);
      if (res.success) {
        setCanReview(res.data.canReview);
        if (!res.data.canReview) {
          setPermissionMessage(res.data.message);
        }
      }
    } catch (error) {
      console.error('Check permission error:', error);
      // Nếu API check lỗi (403, 500) thì mặc định cứ để form hiện, logic submit sẽ chặn sau
    } finally {
      setCheckingPermission(false);
    }
  };

  // Nếu chưa đăng nhập -> Đã xử lý UI login
  if (!isAuthenticated) {
    return (
      <Card className="review-form-container" style={{ textAlign: 'center' }}>
        <p>Vui lòng đăng nhập để đánh giá sản phẩm này.</p>
        <Button type="primary" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </Card>
    );
  }

  // Nếu không đủ điều kiện review -> Hiện Alert thay vì Form
  if (!canReview) {
    return (
      <div className="review-form-container">
        <Alert
          message="Không thể đánh giá"
          description={permissionMessage}
          type="info"
          showIcon
        />
      </div>
    );
  }

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const reviewData = {
        productId,
        rating: values.rating,
        comment: values.comment
      };
      
      await reviewAPI.create(reviewData);
      
      message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      form.resetFields();
      setCanReview(false); // Đánh giá xong thì ẩn form luôn
      setPermissionMessage('Bạn đã đánh giá sản phẩm này rồi.');
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Submit review error:', error);
      if (error.response?.status === 400) {
        message.error(error.response.data.message || 'Bạn đã đánh giá sản phẩm này rồi!');
      } else {
        message.error('Gửi đánh giá thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="form-title">Gửi đánh giá của bạn</h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ rating: 5 }}
        disabled={checkingPermission} // Disable while checking
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontWeight: 500 }}>Chất lượng sản phẩm:</span>
          <Form.Item name="rating" noStyle rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
            <Rate />
          </Form.Item>
        </div>

        <Form.Item
          name="comment"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung đánh giá!' },
            { min: 10, message: 'Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự)' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..." 
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading || checkingPermission}>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm;

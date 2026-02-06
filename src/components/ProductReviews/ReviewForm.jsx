import React, { useState } from 'react';
import { Form, Input, Button, Rate, message, Card } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../../api';

const { TextArea } = Input;

const ReviewForm = ({ productId, onSuccess }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
      if (onSuccess) onSuccess();
      
    } catch (error) {
      // Handle known errors cleanly
      if (error.response) {
        if (error.response.status === 403) {
          message.error('Bạn cần mua và nhận hàng thành công mới được đánh giá sản phẩm này.');
          return;
        }
        if (error.response.status === 400) {
          message.error(error.response.data.message || 'Bạn đã đánh giá sản phẩm này rồi!');
          return;
        }
      }
      
      console.error('Submit review error:', error);
      message.error('Gửi đánh giá thất bại. Vui lòng thử lại sau.');
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm;

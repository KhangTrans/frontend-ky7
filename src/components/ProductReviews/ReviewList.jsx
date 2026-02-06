import React, { useState } from 'react';
import { Avatar, Rate, Button, Input, message } from 'antd';
import { UserOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { reviewAPI } from '../../api';

const { TextArea } = Input;

const ReviewList = ({ reviews, onReviewUpdated }) => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [replyingTo, setReplyingTo] = useState(null); // ID of review being replied to
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReplyClick = (reviewId) => {
    if (replyingTo === reviewId) {
      setReplyingTo(null);
    } else {
      setReplyingTo(reviewId);
      setReplyContent('');
    }
  };

  const submitReply = async (reviewId) => {
    if (!replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      await reviewAPI.reply(reviewId, { comment: replyContent });
      message.success('Đã gửi phản hồi thành công!');
      setReplyingTo(null);
      setReplyContent('');
      if (onReviewUpdated) onReviewUpdated(); // Refresh list
    } catch (error) {
      console.error('Reply error:', error);
      message.error('Gửi phản hồi thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">Chưa có đánh giá nào.</div>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review._id} className="review-item">
          <div className="review-header-info">
            <div className="user-info">
              <Avatar 
                src={review.user?.avatar} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#87d068' }}
              />
              <div>
                <div className="user-name">{review.user?.fullName || 'Người dùng ẩn danh'}</div>
                <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
              </div>
            </div>
            <div className="review-date">
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
          
          <div className="review-content">
            {review.comment}
          </div>

          {/* Shop Reply Section */}
          {review.reply ? (
            <div className="shop-reply">
              <div className="reply-header">
                <span>Phản hồi từ Shop</span>
                <span style={{ fontSize: 12, fontWeight: 'normal', color: '#666' }}>
                  {dayjs(review.reply.repliedAt).format('DD/MM/YYYY')}
                </span>
              </div>
              <div className="reply-content">
                {review.reply.comment}
              </div>
            </div>
          ) : (
            /* Admin Reply Action */
            isAdmin && (
              <div className="admin-action">
                {replyingTo === review._id ? (
                  <div style={{ marginTop: 12 }}>
                    <TextArea 
                      rows={2} 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      autoFocus
                    />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={<SendOutlined />} 
                        onClick={() => submitReply(review._id)}
                        loading={submitting}
                      >
                        Gửi
                      </Button>
                      <Button size="small" onClick={() => setReplyingTo(null)}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button type="link" onClick={() => handleReplyClick(review._id)} style={{ paddingLeft: 0 }}>
                    Trả lời
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;

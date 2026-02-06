import React, { useEffect, useState, useCallback } from 'react';
import { Spin, message } from 'antd';
import { reviewAPI } from '../../api';
import ReviewStats from './ReviewStats';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import './styles.css';

const ProductReviews = ({ productId }) => {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviewsData = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      
      // Fetch stats and list in parallel
      const [statsData, reviewsData] = await Promise.all([
        reviewAPI.getStats(productId).catch(err => {
            console.error('Fetch stats error:', err);
            return null; // Don't break if stats fail
        }),
        reviewAPI.getAll(productId).catch(err => {
            console.error('Fetch reviews error:', err);
            return [];
        })
      ]);

      if (statsData?.success) {
        setStats(statsData.data);
      }
      
      if (reviewsData?.success) {
        setReviews(reviewsData.data);
      } else if (Array.isArray(reviewsData)) {
          // Fallback if API returns array directly
          setReviews(reviewsData);
      }
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // message.error('Không thể tải đánh giá sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  return (
    <div className="product-reviews-container" id="reviews-section">
      <div className="review-header">
        <h2 className="review-title">Đánh giá sản phẩm</h2>
      </div>

      {/* Review Statistics */}
      <ReviewStats stats={stats} />

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Left Column: Review List */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin tip="Đang tải đánh giá..." />
                </div>
            ) : (
                <ReviewList 
                    reviews={reviews} 
                    onReviewUpdated={fetchReviewsData}
                />
            )}
        </div>

        {/* Right Column: Add Review Form */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
            <ReviewForm 
                productId={productId} 
                onSuccess={fetchReviewsData}
            />
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

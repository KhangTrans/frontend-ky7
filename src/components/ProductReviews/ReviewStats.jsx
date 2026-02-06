import React from 'react';
import { Rate, Progress } from 'antd';
import './styles.css';

const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const { averageRating, totalReviews, distribution } = stats;

  return (
    <div className="review-stats">
      <div className="review-summary">
        <div className="average-rating">
          <span className="rating-number">{parseFloat(averageRating || 0).toFixed(1)}</span>
          <Rate disabled allowHalf value={parseFloat(averageRating || 0)} />
          <span className="total-reviews">{totalReviews} đánh giá</span>
        </div>
      </div>
      
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution ? distribution[star] || 0 : 0;
          const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={star} className="distribution-row">
              <span className="star-label">{star} sao</span>
              <div className="progress-bar">
                <Progress percent={percent} showInfo={false} strokeColor="#fadb14" trailingColor="#f0f0f0" />
              </div>
              <span className="count-label">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewStats;

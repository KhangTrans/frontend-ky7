import { useMemo, useCallback } from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import './BannerCarousel.css';

// Custom arrows - định nghĩa ngoài component
const PrevArrow = ({ onClick }) => (
  <button className="banner-arrow banner-arrow-prev" onClick={onClick}>
    <LeftOutlined />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button className="banner-arrow banner-arrow-next" onClick={onClick}>
    <RightOutlined />
  </button>
);

const BannerCarousel = ({ onBannerChange }) => {
  const { settings, loading } = useSettings();
  const navigate = useNavigate();

  // Sử dụng useMemo thay vì useState + useEffect
  const banners = useMemo(() => {
    return settings?.appearance?.banners
      ?.filter(b => b.isActive)
      ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
  }, [settings?.appearance?.banners]);

  // Callback when slide changes
  const handleBeforeChange = useCallback((from, to) => {
    if (onBannerChange && banners[to]) {
      onBannerChange(banners[to]);
    }
  }, [banners, onBannerChange]);

  // Loading state hoặc không có banner - hiển thị default gradient
  if (loading || banners.length === 0) {
    return (
      <div className="banner-carousel-container banner-default">
        <div className="banner-default-bg"></div>
      </div>
    );
  }

  const handleBannerClick = (banner) => {
    if (banner.link) {
      // Kiểm tra nếu là link nội bộ (bắt đầu bằng /) thì navigate, ngược lại redirect
      if (banner.link.startsWith('/')) {
        navigate(banner.link);
      } else {
        // Nếu là link ngoài (http/https), redirect trong cùng tab
        window.location.href = banner.link;
      }
    }
  };

  return (
    <div className="banner-carousel-container">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots={{ className: 'banner-dots' }}
        arrows
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
        effect="fade"
        className="banner-carousel"
        beforeChange={handleBeforeChange}
      >
        {banners.map((banner) => (
          <div key={banner._id} className="banner-slide">
            <div 
              className={`banner-content ${banner.link ? 'clickable' : ''}`}
              onClick={() => handleBannerClick(banner)}
            >
              <img 
                src={banner.imageUrl} 
                alt={banner.title || 'Banner'} 
                className="banner-image"
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;

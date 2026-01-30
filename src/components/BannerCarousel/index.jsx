import { useMemo, useCallback } from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSettings } from '../../contexts/SettingsContext';
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
      window.open(banner.link, '_blank', 'noopener,noreferrer');
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

// Export thêm hook để lấy current banner
export const useBanners = () => {
  const { settings } = useSettings();
  
  const banners = useMemo(() => {
    return settings?.appearance?.banners
      ?.filter(b => b.isActive)
      ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
  }, [settings?.appearance?.banners]);
  
  return { banners, hasBanners: banners.length > 0 };
};

export default BannerCarousel;

import { useState, useEffect, useCallback, useRef } from "react";
import { LeftOutlined, RightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton, Tag, Button } from "antd";
import { bannerAPI } from "../../api";
import "./BannerCarousel.css";

const BannerCarousel = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);

  const fetchActiveBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bannerAPI.getActive();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
  }, [currentIndex, banners.length]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1 === banners.length ? 0 : prev + 1));
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, banners, resetTimer]);

  if (loading) {
    return (
      <div className="banner-carousel-container">
        <Skeleton.Button active block style={{ height: 450, borderRadius: 12 }} />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.5 } },
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  return (
    <div className="banner-carousel-container">
      <div className="slider-viewport">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            className="banner-slide"
            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
          >
            <div className="banner-overlay">
              <motion.div 
                className="banner-content-glass"
                initial="initial"
                animate="animate"
                variants={textVariants}
                onClick={(e) => {
                  // Prevent navigation if actually dragging
                  if (Math.abs(e.movementX) < 5 && Math.abs(e.movementY) < 5) {
                    navigate(`/promotion/${currentBanner._id}`);
                  }
                }}
              >
                <Tag color="#f50" className="discount-badge">
                   GIẢM GIÁ {currentBanner.discountPercent}%
                </Tag>
                <h2 className="banner-title">{currentBanner.title}</h2>
                <p className="banner-desc">{currentBanner.description}</p>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<ShoppingOutlined />}
                    className="banner-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/promotion/${currentBanner._id}`);
                    }}
                >
                    Săn ngay
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <>
          <button className="banner-arrow banner-arrow-prev" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
            <LeftOutlined />
          </button>
          <button className="banner-arrow banner-arrow-next" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            <RightOutlined />
          </button>
          <div className="banner-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;

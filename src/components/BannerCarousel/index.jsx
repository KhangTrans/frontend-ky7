import { useState, useEffect, useCallback, useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../hooks/useSettings";
import "./BannerCarousel.css";

const BannerCarousel = ({ onBannerChange }) => {
  const { settings, loading } = useSettings();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);

  // Lấy danh sách banners active
  const banners = (settings?.appearance?.banners || [])
    .filter((b) => b.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Reset timer khi chuyển slide
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  }, [currentIndex, banners.length]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1 === banners.length ? 0 : prev + 1));
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  // Thông báo banner thay đổi ra ngoài
  useEffect(() => {
    if (onBannerChange && banners[currentIndex]) {
      onBannerChange(banners[currentIndex]);
    }
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, banners, onBannerChange, resetTimer]);

  if (loading || banners.length === 0) {
    return (
      <div className="banner-carousel-container banner-default">
        <div className="banner-default-bg"></div>
      </div>
    );
  }

  const handleBannerClick = (banner) => {
    if (banner.link) navigate(banner.link);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="banner-carousel-container custom-slider">
      <div className="slider-viewport">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="banner-slide"
            onClick={() => handleBannerClick(banners[currentIndex])}
            style={{
              backgroundImage: `url(${banners[currentIndex].imageUrl})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
              cursor: banners[currentIndex].link ? "pointer" : "default",
            }}
          />
        </AnimatePresence>
      </div>

      {/* Điều hướng - Arrows */}
      {banners.length > 1 && (
        <>
          <button
            className="banner-arrow banner-arrow-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <LeftOutlined />
          </button>
          <button
            className="banner-arrow banner-arrow-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <RightOutlined />
          </button>
        </>
      )}

      {/* Điều hướng - Dots */}
      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;

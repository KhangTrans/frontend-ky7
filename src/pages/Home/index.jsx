import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRightOutlined } from "@ant-design/icons";
import HomeNavbar from "../../components/HomeNavbar";
import Footer from "../../components/Footer";
import { categoryAPI } from "../../api";
import "./Home.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredCategories, setFeaturedCategories] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchFeaturedCategories = async () => {
      try {
        const res = await categoryAPI.getFeatured();
        if (res.success && Array.isArray(res.data)) {
          setFeaturedCategories(res.data);
        }
      } catch (error) {
        console.error("Error fetching featured categories:", error);
      }
    };

    fetchFeaturedCategories();
  }, []);

  const cardColors = ["#A5F3FC", "#C7D2FE", "#DDD6FE", "#FECACA", "#FDE68A"];

  return (
    <div className="landing-container">
      <HomeNavbar />

      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-wrap">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>
              Nâng Tầm
              <br />
              Phong Cách
              <br />
              Công Nghệ.
            </h1>
            <p>
              Khám phá bộ sưu tập thiết bị và phụ kiện công nghệ định hình tương
              lai. Trải nghiệm mua sắm đẳng cấp và khác biệt ngay hôm nay.
            </p>
            <button className="btn-neo" onClick={() => navigate("/products")}>
              Bắt Đầu Mua Sắm <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </button>
          </motion.div>

          <motion.div
            className="hero-image-frame"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1981&auto=format&fit=crop"
              alt="Modern Tech Lifestyle"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS */}
      <section className="section-common">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Danh Mục Nổi Bật
        </motion.h2>

        <div className="grid-3">
          {featuredCategories.length > 0 ? (
            featuredCategories.map((category, index) => (
              <FeatureCard
                key={category._id || index}
                img={
                  category.imageUrl ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                role={`COLLECTION 0${index + 1}`}
                title={category.name}
                color={cardColors[index % cardColors.length]}
                onClick={() =>
                  navigate(
                    `/products?category=${encodeURIComponent(category.name)}`,
                  )
                }
              />
            ))
          ) : (
            // Fallback content while loading or empty
            <>
              <FeatureCard
                img="https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&auto=format&fit=crop&q=60"
                role="LOADING..."
                title="Laptop & Workstation"
                color="#A5F3FC"
                onClick={() => navigate("/products")}
              />
              <FeatureCard
                img="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60"
                role="LOADING..."
                title="Smartphone & Tablet"
                color="#C7D2FE"
                onClick={() => navigate("/products")}
              />
              <FeatureCard
                img="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60"
                role="LOADING..."
                title="Âm Thanh & Phụ Kiện"
                color="#DDD6FE"
                onClick={() => navigate("/products")}
              />
            </>
          )}
        </div>
      </section>

      {/* 3. JOURNEY SECTION */}
      <section className="section-common">
        <motion.div
          className="journey-grid"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="journey-left">
            <span>
              Trải Nghiệm
              <br />
              Mua Sắm
              <br />
              Hoàn Hảo
            </span>
          </div>
          <div className="journey-right">
            <div className="journey-step">
              <h3 style={{ color: "#2563EB" }}>TƯ VẤN CHUYÊN SÂU</h3>
              <p>
                Đội ngũ chuyên gia công nghệ của chúng tôi luôn sẵn sàng lắng
                nghe và tư vấn giải pháp tối ưu nhất cho nhu cầu của bạn.
              </p>
            </div>
            <div className="journey-step">
              <h3 style={{ color: "#7C3AED" }}>TRẢI NGHIỆM THỰC TẾ</h3>
              <p>
                Không gian showroom hiện đại cho phép bạn trải nghiệm tận tay
                mọi sản phẩm công nghệ mới nhất trước khi quyết định.
              </p>
            </div>
            <div className="journey-step">
              <h3 style={{ color: "#059669" }}>BẢO HÀNH TRỌN ĐỜI</h3>
              <p>
                Cam kết hỗ trợ kỹ thuật và bảo hành chính hãng trọn đời sản
                phẩm, mang lại sự an tâm tuyệt đối cho khách hàng.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. FAQ / SUPPORT */}
      <section className="section-common" style={{ marginBottom: "100px" }}>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Hỗ Trợ Khách Hàng
        </motion.h2>
        <div className="grid-3">
          <FAQCard
            question="Chính sách đổi trả sản phẩm?"
            answer="Chúng tôi hỗ trợ đổi mới 1-1 trong vòng 30 ngày đầu nếu có lỗi từ nhà sản xuất. Hoàn tiền 100% nếu bạn không hài lòng."
          />
          <FAQCard
            question="Thời gian giao hàng bao lâu?"
            answer="Giao hàng hỏa tốc 2h trong nội thành Hà Nội & TP.HCM. 1-3 ngày đối với các tỉnh thành khác. Miễn phí vận chuyển toàn quốc."
          />
          <FAQCard
            question="Có hỗ trợ trả góp không?"
            answer="Chúng tôi liên kết với hơn 20 ngân hàng, hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng hoặc công ty tài chính. Duyệt hồ sơ trong 5 phút."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ img, role, title, color, onClick }) => (
  <motion.div
    className="feature-card"
    whileHover={{ y: -10 }}
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="card-image-box" style={{ backgroundColor: color }}>
      <img
        src={img}
        alt={title}
        onError={(e) =>
          (e.target.src = "https://placehold.co/600x400?text=No+Image")
        }
      />
    </div>
    <div className="feature-info">
      <h3>{role}</h3>
      <h4>{title}</h4>
    </div>
  </motion.div>
);

const FAQCard = ({ question, answer }) => (
  <motion.div
    className="faq-card"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className="faq-header">
      <h3>{question}</h3>
    </div>
    <div className="faq-body">
      <p>{answer}</p>
    </div>
  </motion.div>
);

export default LandingPage;

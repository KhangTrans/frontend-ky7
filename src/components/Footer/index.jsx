import { Link } from 'react-router-dom';
import { 
  FacebookFilled, 
  InstagramFilled, 
  YoutubeFilled, 
  TwitterCircleFilled,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useSettings } from '../../hooks/useSettings';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();
  const store = settings?.store || {};
  const appearance = settings?.appearance || {};
  
  const storeName = store.name || 'KY-7 Shop';
  const storeLogo = store.logo;
  const storeEmail = store.email || 'support@ky7shop.com';
  const storePhone = store.phone || '1900 1234 567';
  const storeAddress = store.address || '123 Đường ABC, Quận XYZ, TP.HCM';
  const storeDescription = store.description || 'Điểm đến tin cậy cho các tín đồ công nghệ. Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất với dịch vụ khách hàng tận tâm.';
  const socialLinks = store.socialLinks || {};
  const footerText = appearance.footerText || `© 2026 ${storeName}. All rights reserved.`;
  
  return (
    <footer className="footer-container">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin cập nhật sản phẩm mới và khuyến mãi đặc biệt</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn..." 
              className="newsletter-input" 
            />
            <button type="submit" className="newsletter-btn">
              <SendOutlined /> Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        {/* Company Info */}
        <div className="footer-col">
          <Link to="/" className="footer-logo">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="footer-logo-image" />
            ) : (
              <span className="logo-icon">🛍️</span>
            )}
            <span className="logo-text">{storeName}</span>
          </Link>
          <p className="footer-desc">
            {storeDescription}
          </p>
          <ul className="contact-info" style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <EnvironmentOutlined className="contact-icon" />
              <span>{storeAddress}</span>
            </li>
            <li>
              <PhoneOutlined className="contact-icon" />
              <span>{storePhone} (8:00 - 21:00)</span>
            </li>
            <li>
              <MailOutlined className="contact-icon" />
              <span>{storeEmail}</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Về chúng tôi</h4>
          <ul className="footer-links">
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/careers">Tuyển dụng</Link></li>
            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/stores">Hệ thống cửa hàng</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul className="footer-links">
            <li><Link to="/guide">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/payment-policy">Phương thức thanh toán</Link></li>
            <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
            <li><Link to="/return">Chính sách đổi trả</Link></li>
            <li><Link to="/warranty">Trung tâm bảo hành</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div className="footer-col">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">
                <FacebookFilled />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
                <InstagramFilled />
              </a>
            )}
            {socialLinks.zalo && (
              <a href={socialLinks.zalo} target="_blank" rel="noopener noreferrer" className="social-btn zalo-btn">
                Z
              </a>
            )}
            {!socialLinks.facebook && !socialLinks.instagram && !socialLinks.zalo && (
              <>
                <a href="#" className="social-btn"><FacebookFilled /></a>
                <a href="#" className="social-btn"><InstagramFilled /></a>
                <a href="#" className="social-btn"><YoutubeFilled /></a>
                <a href="#" className="social-btn"><TwitterCircleFilled /></a>
              </>
            )}
          </div>
          
          <h4 style={{ marginTop: '30px' }}>Thanh toán</h4>
          <div className="payment-methods">
            <div className="payment-badge">VISA</div>
            <div className="payment-badge">MasterCard</div>
            <div className="payment-badge">Momo</div>
            <div className="payment-badge">ZaloPay</div>
            <div className="payment-badge">COD</div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="bottom-content">
          <div className="copyright">
            {footerText}
          </div>
          <div className="bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

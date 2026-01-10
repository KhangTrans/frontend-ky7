import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Component để bảo vệ các route cần admin role
 * Nếu không phải admin thì redirect về home
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Chưa đăng nhập -> về login
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    // Đã đăng nhập nhưng không phải admin -> về home
    return <Navigate to="/" replace />;
  }

  // Là admin -> cho phép truy cập
  return children;
}

export default AdminRoute;

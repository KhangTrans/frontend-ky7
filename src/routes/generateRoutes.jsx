import { Navigate, Suspense } from 'react';
import routesData from './routes.config';
import componentsMap from './components';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div>Đang tải...</div>
  </div>
);

/**
 * Generate routes từ JSON config
 * @param {Array} routesConfig - Mảng cấu hình routes
 * @returns {Array} - Mảng routes cho react-router
 */
export const generateRoutes = (routesConfig) => {
  return routesConfig.map((route) => {
    const { path, component, redirect, meta, children } = route;

    // Nếu là redirect route
    if (redirect) {
      return {
        path,
        element: <Navigate to={redirect} replace />,
      };
    }

    // Lấy component từ map
    const Component = componentsMap[component];

    if (!Component) {
      console.warn(`Component "${component}" not found for route "${path}"`);
      return {
        path,
        element: <Navigate to="/" replace />,
      };
    }

    // Wrap component với Suspense để support lazy loading
    let element = (
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    );

    // Nếu route yêu cầu admin role, wrap với AdminRoute
    if (meta?.roles?.includes('admin') && component === 'DashboardLayout') {
      element = <AdminRoute>{element}</AdminRoute>;
    }
    // Nếu route yêu cầu authentication (nhưng không phải admin-only), wrap với ProtectedRoute
    else if (meta?.requiresAuth) {
      element = <ProtectedRoute>{element}</ProtectedRoute>;
    }

    const routeObject = {
      path,
      element,
      meta,
    };

    // Nếu có children routes, generate recursively
    if (children && children.length > 0) {
      routeObject.children = generateRoutes(children);
    }

    return routeObject;
  });
};

// Export routes đã được generate
const routes = generateRoutes(routesData);

export default routes;

import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import routes from './routes';

import ChatWidget from './components/ChatWidget';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

// Component để render routes từ JSON config
const AppRoutes = () => {
    const element = useRoutes(routes);
    return element;
};

// Wrapper để apply Ant Design theme từ settings
const ThemedApp = ({ children }) => {
  const { settings, loading } = useSettings();
  const primaryColor = settings?.appearance?.primaryColor || '#1890ff';
  
  // Hiển thị loading spinner khi đang fetch settings lần đầu
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  return (
    <ConfigProvider 
      locale={viVN}
      theme={{
        token: {
          colorPrimary: primaryColor,
          colorLink: primaryColor,
        },
      }}
    >
      <AntdApp>
        {children}
      </AntdApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <ThemedApp>
        <BrowserRouter>
          <AppRoutes />
          <ChatWidget />
        </BrowserRouter>
      </ThemedApp>
    </SettingsProvider>
  );
}

export default App;

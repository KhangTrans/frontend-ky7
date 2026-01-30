import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
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
  const { settings } = useSettings();
  const primaryColor = settings?.appearance?.primaryColor || '#1890ff';
  
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

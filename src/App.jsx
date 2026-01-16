import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import routes from './routes';

import ChatWidget from './components/ChatWidget';

// Component để render routes từ JSON config
const AppRoutes = () => {
    const element = useRoutes(routes);
    return element;
};

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
          <ChatWidget />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Card, Spin, message, Typography } from 'antd';
import { ShopOutlined, BgColorsOutlined } from '@ant-design/icons';
import { settingsAPI } from '../../api';
import StoreSettings from './StoreSettings';
import AppearanceSettings from './AppearanceSettings';
import './Settings.css';

const { Title } = Typography;

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('store');

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getAll();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      message.error('Không thể tải cài đặt. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleStoreUpdate = async (storeData) => {
    try {
      const response = await settingsAPI.updateStore(storeData);
      if (response.success) {
        message.success('Cập nhật thông tin cửa hàng thành công!');
        setSettings(prev => ({
          ...prev,
          store: response.data
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to update store:', error);
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
      return false;
    }
  };

  const handleAppearanceUpdate = async (appearanceData) => {
    try {
      const response = await settingsAPI.updateAppearance(appearanceData);
      if (response.success) {
        message.success('Cập nhật giao diện thành công!');
        setSettings(prev => ({
          ...prev,
          appearance: {
            ...prev.appearance,
            ...response.data
          }
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to update appearance:', error);
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
      return false;
    }
  };

  const handleBannerCreate = async (bannerData) => {
    try {
      const response = await settingsAPI.createBanner(bannerData);
      if (response.success) {
        message.success('Thêm banner thành công!');
        await fetchSettings();
        return true;
      }
    } catch (error) {
      console.error('Failed to create banner:', error);
      message.error(error.response?.data?.message || 'Thêm banner thất bại!');
      return false;
    }
  };

  const handleBannerUpdate = async (bannerId, bannerData) => {
    try {
      const response = await settingsAPI.updateBanner(bannerId, bannerData);
      if (response.success) {
        message.success('Cập nhật banner thành công!');
        await fetchSettings();
        return true;
      }
    } catch (error) {
      console.error('Failed to update banner:', error);
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
      return false;
    }
  };

  const handleBannerDelete = async (bannerId) => {
    try {
      const response = await settingsAPI.deleteBanner(bannerId);
      if (response.success) {
        message.success('Xóa banner thành công!');
        await fetchSettings();
        return true;
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      message.error(error.response?.data?.message || 'Xóa banner thất bại!');
      return false;
    }
  };

  const tabItems = [
    {
      key: 'store',
      label: (
        <span>
          <ShopOutlined />
          Thông tin cửa hàng
        </span>
      ),
      children: (
        <StoreSettings 
          data={settings?.store} 
          onUpdate={handleStoreUpdate}
        />
      ),
    },
    {
      key: 'appearance',
      label: (
        <span>
          <BgColorsOutlined />
          Giao diện
        </span>
      ),
      children: (
        <AppearanceSettings 
          data={settings?.appearance}
          onUpdateAppearance={handleAppearanceUpdate}
          onCreateBanner={handleBannerCreate}
          onUpdateBanner={handleBannerUpdate}
          onDeleteBanner={handleBannerDelete}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="settings-loading">
        <Spin size="large" tip="Đang tải cài đặt..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Title level={2}>Cài đặt hệ thống</Title>
      </div>
      
      <Card className="settings-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          tabPosition="left"
          className="settings-tabs"
        />
      </Card>
    </div>
  );
};

export default Settings;

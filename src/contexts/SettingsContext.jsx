import { createContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../api';

// Default settings khi chưa có data từ API
const defaultSettings = {
  store: {
    name: 'KY-7 Shop',
    logo: '',
    email: 'support@ky7shop.com',
    phone: '1900 1234 567',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    description: '',
    socialLinks: {
      facebook: '',
      zalo: '',
      instagram: '',
    }
  },
  appearance: {
    primaryColor: '#1890ff',
    footerText: '© 2026 KY-7 Shop. All rights reserved.',
    banners: []
  }
};

// Create context
const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  error: null,
  refreshSettings: () => {},
});

// Provider component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.getAll();
      
      if (response.success && response.data) {
        setSettings({
          store: {
            ...defaultSettings.store,
            ...response.data.store,
          },
          appearance: {
            ...defaultSettings.appearance,
            ...response.data.appearance,
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err.message || 'Không thể tải cài đặt');
      // Giữ default settings nếu có lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply primary color to CSS variables
  useEffect(() => {
    if (settings?.appearance?.primaryColor) {
      const primaryColor = settings.appearance.primaryColor;
      const primaryColorLight = adjustColor(primaryColor, 20);
      const primaryColorDark = adjustColor(primaryColor, -20);
      
      // Set hex colors
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--primary-color-light', primaryColorLight);
      document.documentElement.style.setProperty('--primary-color-dark', primaryColorDark);
      
      // Set RGB values for rgba() usage
      const rgb = hexToRgb(primaryColor);
      const rgbDark = hexToRgb(primaryColorDark);
      if (rgb) {
        document.documentElement.style.setProperty('--primary-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
      if (rgbDark) {
        document.documentElement.style.setProperty('--primary-color-dark-rgb', `${rgbDark.r}, ${rgbDark.g}, ${rgbDark.b}`);
      }
    }
  }, [settings?.appearance?.primaryColor]);

  const value = {
    settings,
    loading,
    error,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Utility: Điều chỉnh độ sáng màu
function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Utility: Hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default SettingsContext;

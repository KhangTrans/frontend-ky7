import { useMemo } from 'react';
import { useSettings } from './useSettings';

// Hook để lấy banners đang active
export const useBanners = () => {
  const { settings } = useSettings();

  const banners = useMemo(() => {
    return settings?.appearance?.banners
      ?.filter(b => b.isActive)
      ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
  }, [settings?.appearance?.banners]);

  return { banners, hasBanners: banners.length > 0 };
};

export default useBanners;

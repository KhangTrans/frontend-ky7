import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://provinces.open-api.vn/api';

/**
 * Hook để lấy danh sách tỉnh/thành phố, quận/huyện, phường/xã Việt Nam
 */
export const useProvinces = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Fetch tất cả tỉnh/thành phố
  const fetchProvinces = useCallback(async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const response = await fetch(`${API_BASE}/p/`);
      const data = await response.json();
      setProvinces(data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  }, []);

  // Fetch quận/huyện theo mã tỉnh
  const fetchDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data?.districts || []);
      setWards([]); // Reset wards khi đổi tỉnh
    } catch (error) {
      console.error('Lỗi khi tải danh sách quận/huyện:', error);
      setDistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  }, []);

  // Fetch phường/xã theo mã quận/huyện
  const fetchWards = useCallback(async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, wards: true }));
    try {
      const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
      const data = await response.json();
      setWards(data?.wards || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phường/xã:', error);
      setWards([]);
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  }, []);

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  return {
    provinces,
    districts,
    wards,
    loading,
    fetchDistricts,
    fetchWards,
  };
};

export default useProvinces;

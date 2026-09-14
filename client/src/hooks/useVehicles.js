// client/src/hooks/useVehicles.js
import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../services/api/vehicleApi.js';
import { useAppContext } from '../context/AppContext.jsx';

export function useVehicles(initialFilter = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const { refreshKey } = useAppContext();

  const fetchVehicles = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleApi.getVehicles({ ...filter, ...params });
      if (response.success) {
        setVehicles(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load vehicle registry');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles, refreshKey]);

  return {
    vehicles,
    pagination,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchVehicles
  };
}

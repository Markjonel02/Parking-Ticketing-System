// client/src/hooks/useTickets.js
import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../services/api/ticketApi.js';
import { useAppContext } from '../context/AppContext.jsx';

export function useTickets(initialFilter = {}) {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const { refreshKey } = useAppContext();

  const fetchTickets = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ticketApi.getTickets({ ...filter, ...params });
      if (response.success) {
        setTickets(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, refreshKey]);

  return {
    tickets,
    pagination,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchTickets
  };
}

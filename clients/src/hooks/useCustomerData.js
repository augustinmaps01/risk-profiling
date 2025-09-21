import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';

export const useCustomerData = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine the correct endpoint based on user role
  const getCustomerEndpoint = () => {
    if (user?.roles?.some(role => role.slug === 'admin')) {
      return API_ENDPOINTS.CUSTOMERS_INDEX; // admin/customers
    } else if (user?.roles?.some(role => role.slug === 'compliance')) {
      return API_ENDPOINTS.COMPLIANCE_CUSTOMERS; // compliance/customers
    } else if (user?.roles?.some(role => role.slug === 'manager')) {
      return API_ENDPOINTS.MANAGER_CUSTOMERS_LIST; // manager/customers-list
    } else {
      return API_ENDPOINTS.CUSTOMERS_LIST; // user/customers-list
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    const endpoint = getCustomerEndpoint();

    try {
      const res = await api.get(endpoint);

      if (res.data && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else {
        console.error("Invalid customer data format:", res.data);
        setError("Invalid data format received from server");
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage;
      if (err.response?.status === 401) {
        errorMessage = "Your session has expired. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to view customer data.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        errorMessage = "Failed to connect to backend API: Connection Failed. Please try again.";
      } else {
        errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      }

      setError(errorMessage);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  return { customers, loading, error, refetch: fetchCustomers };
};

export const useCustomerFilters = (customers, isComplianceOfficer) => {
  const [filters, setFilters] = useState({
    dateFrom: "", dateTo: "", riskLevel: "", search: "", branchId: "",
  });

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    if (filters.search) {
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.riskLevel) {
      filtered = filtered.filter((customer) => customer.riskLevel === filters.riskLevel);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((customer) => customer.date_created >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((customer) => customer.date_created <= filters.dateTo);
    }

    if (filters.branchId && isComplianceOfficer) {
      filtered = filtered.filter((customer) => {
        const customerBranchId = customer.branch_id;
        const selectedBranchId = parseInt(filters.branchId);
        return customerBranchId === selectedBranchId;
      });
    }

    return filtered;
  }, [customers, filters, isComplianceOfficer]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ dateFrom: "", dateTo: "", riskLevel: "", search: "", branchId: "" });
  };

  return { filteredCustomers, filters, handleFilterChange, handleClearFilters };
};
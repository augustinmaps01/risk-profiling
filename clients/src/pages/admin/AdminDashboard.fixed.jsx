import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    riskStats: { low: 0, moderate: 0, high: 0 },
    recentCustomers: [],
    additionalStats: { todayCount: 0, thisWeekCount: 0, thisMonthCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dashboard");

      if (response.data) {
        setDashboardData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");

      // Set default data to prevent blank page
      setDashboardData({
        totalCustomers: 0,
        riskStats: { low: 0, moderate: 0, high: 0 },
        recentCustomers: [],
        additionalStats: { todayCount: 0, thisWeekCount: 0, thisMonthCount: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const { totalCustomers, riskStats, recentCustomers } = dashboardData;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Complete system overview and management console
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-yellow-800">API Connection Issue</h3>
              <p className="text-yellow-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Simple Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm font-semibold">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 text-sm font-semibold">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Low Risk</p>
              <p className="text-2xl font-bold text-green-900">{riskStats.low || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-sm font-semibold">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Moderate Risk</p>
              <p className="text-2xl font-bold text-yellow-900">{riskStats.moderate || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm font-semibold">🚨</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-red-900">{riskStats.high || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>

        {recentCustomers && recentCustomers.length > 0 ? (
          <div className="space-y-3">
            {recentCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm font-semibold">
                      {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{customer.time_ago || 'Recently'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    customer.riskLevel === 'HIGH RISK'
                      ? 'bg-red-100 text-red-800'
                      : customer.riskLevel === 'MODERATE RISK'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {customer.riskLevel?.replace(' RISK', '') || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium mb-2">No recent assessments</p>
            <p className="text-sm">Recent customer assessments will appear here</p>
          </div>
        )}
      </div>

      {/* Debug Info (Development only) */}
      {import.meta.env.DEV && (
        <div className="mt-6 bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify({
              loading,
              error,
              isAuthenticated,
              totalCustomers,
              userRoles: user?.roles?.map(r => r.slug)
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
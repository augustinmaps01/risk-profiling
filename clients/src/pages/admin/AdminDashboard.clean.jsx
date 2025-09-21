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
  const [branchStats, setBranchStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchBranchStats();
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

  const fetchBranchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/branch-stats");
      if (response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : Object.values(response.data);
        setBranchStats(dataArray);
      }
    } catch (err) {
      console.error("Branch stats error:", err);
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const { totalCustomers, riskStats, recentCustomers } = dashboardData;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Complete system overview and management console
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{totalCustomers || 0}</p>
              <p className="text-xs text-blue-100 mt-1">System-wide</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Low Risk</p>
              <p className="text-2xl font-bold">{riskStats.low || 0}</p>
              <p className="text-xs text-green-100 mt-1">Safe customers</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Moderate Risk</p>
              <p className="text-2xl font-bold">{riskStats.moderate || 0}</p>
              <p className="text-xs text-yellow-100 mt-1">Monitor required</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">High Risk</p>
              <p className="text-2xl font-bold">{riskStats.high || 0}</p>
              <p className="text-xs text-red-100 mt-1">Immediate attention</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assessments */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recent Assessments
          </h3>

          {recentCustomers && recentCustomers.length > 0 ? (
            <div className="space-y-3">
              {recentCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-semibold">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{customer.time_ago || 'Recently'}</p>
                    </div>
                  </div>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium mb-2">No recent assessments</p>
              <p className="text-sm">Recent customer assessments will appear here</p>
            </div>
          )}
        </div>

        {/* Branch Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Branch Overview
          </h3>

          {branchStats && branchStats.length > 0 ? (
            <div className="space-y-3">
              {branchStats.slice(0, 5).map((branch, index) => {
                const total = (branch.low_risk || 0) + (branch.moderate_risk || 0) + (branch.high_risk || 0);
                return (
                  <div key={branch.id || index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{branch.branch_name}</h4>
                      <span className="text-sm font-bold text-blue-600">{total} total</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Low: {branch.low_risk || 0}</span>
                      <span className="text-yellow-600">Moderate: {branch.moderate_risk || 0}</span>
                      <span className="text-red-600">High: {branch.high_risk || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg font-medium mb-2">No branch data</p>
              <p className="text-sm">Branch statistics will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="mt-8 bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify({
              loading,
              error: error || 'none',
              isAuthenticated,
              totalCustomers,
              userEmail: user?.email,
              recentCustomersCount: recentCustomers?.length || 0,
              branchStatsCount: branchStats?.length || 0
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
/**
 * EXAMPLE: Dashboard component updated with centralized permission system
 *
 * This shows how to replace hardcoded role checks with permission-based access control.
 * Use this as a reference for updating the actual Dashboard.jsx component.
 */

import React, { useState, useEffect } from "react";
import { usePermissions } from "../hooks/usePermissions";
import PermissionGate from "../components/auth/PermissionGate";
import { PERMISSIONS } from "../config/permissions";

export default function DashboardWithPermissions() {
  const { can, canAccess, hasPermission, isCompliance } = usePermissions();
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    riskStats: { low: 0, moderate: 0, high: 0 },
    recentCustomers: [],
  });
  const [branchStats, setBranchStats] = useState([]);

  useEffect(() => {
    fetchDashboardData();

    // Instead of: if (userRole === "compliance" || userRole === "manager" || userRole === "users")
    // Use permission-based check:
    if (can.viewBranchAnalytics()) {
      fetchBranchStats();
    }
  }, [can]);

  const fetchDashboardData = async () => {
    // Dashboard data fetching logic
  };

  const fetchBranchStats = async () => {
    // Branch stats fetching logic
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
            <p className="text-slate-600">
              Welcome to RBT Bank Client Risk Management System
            </p>
          </div>

          {/* Instead of hardcoded role check: (userRole === "compliance" || userRole === "manager" || !userRole) */}
          <PermissionGate permission={PERMISSIONS.VIEW_BRANCH_ANALYTICS}>
            <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-full">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Overview</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Analysis</span>
              </div>
            </div>
          </PermissionGate>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold">{dashboardData.totalCustomers}</p>
            </div>
          </div>
        </div>
        {/* ... other KPI cards */}
      </div>

      {/* Risk Analysis Overview */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        {/* Risk Distribution - Only for users with compliance-level access */}
        <PermissionGate permission={PERMISSIONS.VIEW_SYSTEM_ANALYTICS}>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Bank-wide Risk Distribution
            </h3>
            {/* Risk distribution content */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-700">Low Risk</span>
                  <span className="text-lg font-bold text-green-600">
                    {dashboardData.riskStats.low}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        dashboardData.totalCustomers > 0
                          ? (dashboardData.riskStats.low / dashboardData.totalCustomers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* ... other risk categories */}
            </div>
          </div>
        </PermissionGate>

        {/* Recent Assessments - Available to all dashboard users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Recent Assessments
          </h3>
          <div className="space-y-2">
            {dashboardData.recentCustomers.length > 0 ? (
              dashboardData.recentCustomers.slice(0, 5).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-600">{customer.time_ago}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full">
                    {customer.riskLevel?.replace(" RISK", "") || "N/A"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-500">
                No recent assessments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Branch Performance - Permission-based visibility */}
      <PermissionGate permission={PERMISSIONS.VIEW_BRANCH_ANALYTICS}>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Branch Performance Overview
          </h2>
          <div className="bg-white rounded-lg shadow">
            {branchStats.length > 0 ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Branch Name</th>
                        <th className="text-center py-3 px-4">Total Assessments</th>
                        <th className="text-center py-3 px-4">Low Risk</th>
                        <th className="text-center py-3 px-4">Moderate Risk</th>
                        <th className="text-center py-3 px-4">High Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchStats.map((branch) => (
                        <tr key={branch.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">{branch.branch_name}</td>
                          <td className="py-3 px-4 text-center">
                            {(branch.low_risk || 0) +
                              (branch.moderate_risk || 0) +
                              (branch.high_risk || 0)}
                          </td>
                          <td className="py-3 px-4 text-center">{branch.low_risk || 0}</td>
                          <td className="py-3 px-4 text-center">{branch.moderate_risk || 0}</td>
                          <td className="py-3 px-4 text-center">{branch.high_risk || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="p-6 text-center text-slate-500">No branch data available</p>
            )}
          </div>
        </div>
      </PermissionGate>

      {/* Action buttons with permission gates */}
      <div className="flex gap-4 mt-8">
        <PermissionGate permission={PERMISSIONS.CREATE_RISK_ASSESSMENTS}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Risk Assessment
          </button>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.VIEW_ADVANCED_REPORTS}>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            View Advanced Reports
          </button>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.EXPORT_REPORTS}>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Export Data
          </button>
        </PermissionGate>
      </div>

      {/* Conditional logic using permission helpers */}
      {can.viewSystemAnalytics() && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">System Analytics</h4>
          <p className="text-blue-700">
            You have access to view system-wide analytics and detailed reports.
          </p>
        </div>
      )}

      {can.manageSystemSettings() && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">System Administration</h4>
          <p className="text-red-700">
            You have administrative privileges to manage system settings.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * MIGRATION GUIDE: Converting hardcoded role checks to permission-based
 *
 * OLD WAY (Hardcoded roles):
 * ```jsx
 * if (userRole === "compliance" || userRole === "manager") {
 *   // Show content
 * }
 * ```
 *
 * NEW WAY (Permission-based):
 * ```jsx
 * <PermissionGate permission={PERMISSIONS.VIEW_BRANCH_ANALYTICS}>
 *   // Show content
 * </PermissionGate>
 *
 * // OR for conditional logic:
 * if (can.viewBranchAnalytics()) {
 *   // Show content
 * }
 * ```
 *
 * BENEFITS:
 * 1. Centralized permission management
 * 2. Easy to modify permissions without code changes
 * 3. More granular control
 * 4. Better maintainability
 * 5. Consistent across the application
 *
 * KEY REPLACEMENTS:
 * - userRole === "admin" → isAdmin or hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD)
 * - userRole === "compliance" → isCompliance or can.viewAdvancedReports()
 * - userRole === "manager" → isManager or can.viewBranchAnalytics()
 * - userRole === "users" → isRegularUser or can.createRiskAssessments()
 */
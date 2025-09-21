import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/permissions";

const PermissionDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const { userPermissions, userRoles, hasPermission, hasRole } = usePermissions();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        🔍 Permission Debug Information
      </h1>

      {/* Authentication Status */}
      <div className="mb-6 bg-white rounded-lg shadow border p-4">
        <h2 className="text-lg font-semibold mb-3">Authentication Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>User Name:</strong> {user?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="mb-6 bg-white rounded-lg shadow border p-4">
        <h2 className="text-lg font-semibold mb-3">User Roles</h2>
        <div className="mb-3">
          <strong>Roles from usePermissions:</strong> {userRoles.join(', ') || 'None'}
        </div>
        <div className="mb-3">
          <strong>Raw user.roles:</strong> {JSON.stringify(user?.roles?.map(r => r.slug)) || 'None'}
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div>Has Admin Role: {hasRole('admin') ? '✅' : '❌'}</div>
          <div>Has Compliance Role: {hasRole('compliance') ? '✅' : '❌'}</div>
          <div>Has Manager Role: {hasRole('manager') ? '✅' : '❌'}</div>
          <div>Has Users Role: {hasRole('users') ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* User Permissions */}
      <div className="mb-6 bg-white rounded-lg shadow border p-4">
        <h2 className="text-lg font-semibold mb-3">User Permissions</h2>
        <div className="mb-3">
          <strong>Total Permissions:</strong> {userPermissions.length}
        </div>
        <div className="mb-4">
          <strong>Key Admin Permissions:</strong>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <div>VIEW_ADMIN_DASHBOARD: {hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD) ? '✅' : '❌'}</div>
            <div>VIEW_USERS: {hasPermission(PERMISSIONS.VIEW_USERS) ? '✅' : '❌'}</div>
            <div>MANAGE_USERS: {hasPermission(PERMISSIONS.MANAGE_USERS) ? '✅' : '❌'}</div>
            <div>VIEW_ROLES: {hasPermission(PERMISSIONS.VIEW_ROLES) ? '✅' : '❌'}</div>
          </div>
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">All User Permissions ({userPermissions.length})</summary>
          <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-xs">
            {userPermissions.length > 0 ? (
              <ul className="space-y-1">
                {userPermissions.map((perm) => (
                  <li key={perm}>• {perm}</li>
                ))}
              </ul>
            ) : (
              <p className="text-red-600">No permissions found!</p>
            )}
          </div>
        </details>
      </div>

      {/* Raw User Data */}
      <div className="mb-6 bg-white rounded-lg shadow border p-4">
        <h2 className="text-lg font-semibold mb-3">Raw User Data</h2>
        <details>
          <summary className="cursor-pointer font-medium">Full User Object</summary>
          <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow border p-4">
        <h2 className="text-lg font-semibold mb-3">Actions</h2>
        <div className="space-x-2">
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Admin Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDebug;
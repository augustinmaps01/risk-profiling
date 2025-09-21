import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Permission Gate Component
 *
 * Conditionally renders children based on user permissions.
 * Replaces hardcoded role checks with centralized permission management.
 *
 * @param {Object} props
 * @param {string|string[]} props.permission - Required permission(s)
 * @param {string|string[]} props.role - Required role(s) (legacy compatibility)
 * @param {string} props.feature - Required UI feature access
 * @param {boolean} props.requireAll - Require all permissions (default: false, requires any)
 * @param {React.ReactNode} props.children - Content to render if permission check passes
 * @param {React.ReactNode} props.fallback - Content to render if permission check fails
 * @param {boolean} props.hideOnFail - Hide completely if permission check fails (default: true)
 */
const PermissionGate = ({
  permission,
  role,
  feature,
  requireAll = false,
  children,
  fallback = null,
  hideOnFail = true,
}) => {
  const {
    hasPermission,
    hasAllPermissions: checkAllPermissions,
    hasRole,
    canAccessFeature,
  } = usePermissions();

  // Check permissions
  let hasAccess = true;

  if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? checkAllPermissions(permission)
        : hasPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }
  }

  // Check roles (legacy compatibility)
  if (hasAccess && role) {
    hasAccess = hasRole(role);
  }

  // Check feature access
  if (hasAccess && feature) {
    hasAccess = canAccessFeature(feature);
  }

  // Return appropriate content based on access
  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideOnFail) {
    return null;
  }

  return fallback;
};

/**
 * Hook version for conditional logic in components
 */
export const usePermissionGate = () => {
  const permissions = usePermissions();

  const checkAccess = ({
    permission,
    role,
    feature,
    requireAll = false,
  }) => {
    let hasAccess = true;

    if (permission) {
      if (Array.isArray(permission)) {
        hasAccess = requireAll
          ? permissions.hasAllPermissions(permission)
          : permissions.hasPermission(permission);
      } else {
        hasAccess = permissions.hasPermission(permission);
      }
    }

    if (hasAccess && role) {
      hasAccess = permissions.hasRole(role);
    }

    if (hasAccess && feature) {
      hasAccess = permissions.canAccessFeature(feature);
    }

    return hasAccess;
  };

  return { checkAccess, ...permissions };
};

export default PermissionGate;
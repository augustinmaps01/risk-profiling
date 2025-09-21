import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleGuard = ({ 
  children, 
  roles = [], 
  permissions = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check roles
  const hasRequiredRole = roles.length === 0 || (
    requireAll 
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role))
  );

  // Check permissions
  const hasRequiredPermission = permissions.length === 0 || (
    requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission))
  );

  // Determine if user should see content
  const shouldShow = hasRequiredRole && hasRequiredPermission;

  return shouldShow ? children : fallback;
};

export default RoleGuard;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import RoleGuard from '../auth/RoleGuard';

/**
 * Permission-based Navigation Component
 *
 * This component renders navigation items based on user permissions and roles,
 * eliminating hardcoded role checks throughout the application.
 */
const PermissionBasedNav = ({ className = '', vertical = false }) => {
  const location = useLocation();
  const { can, canAccess, isAdmin, isCompliance, isManager, isRegularUser } = usePermissions();

  // Navigation items configuration with permission-based visibility
  const navItems = [
    // Dashboard - Different for different roles
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: '🏠',
      show: isAdmin ? can.viewAdminDashboard() : can.viewBasicDashboard(),
      excludeRoles: isAdmin ? [] : ['admin'] // Admin has separate dashboard
    },

    // Risk Assessment - Available to users and managers only
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      path: '/risk-form',
      icon: '📊',
      show: can.createRiskAssessments(),
      exactRoles: ['users', 'manager'] // Available to users and managers, not compliance
    },

    // Customers - Admin, Compliance, Manager
    {
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      icon: '👥',
      show: can.viewCustomers(),
      exactRoles: ['admin', 'compliance', 'manager'] // Exclude regular users
    },

    // Risk Settings - Admin and Compliance only
    {
      id: 'risk-settings',
      label: 'Risk Settings',
      path: '/risk-settings',
      icon: '⚙️',
      show: can.viewRiskSettings(),
      exactRoles: ['admin', 'compliance']
    },

    // Reports - Different levels for different roles
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: '📈',
      show: can.viewBasicReports() || can.viewAdvancedReports(),
      excludeRoles: ['users'] // Regular users don't need reports
    },

    // Admin-specific navigation items
    {
      id: 'user-management',
      label: 'User Management',
      path: '/admin/users',
      icon: '👤',
      show: can.viewUsers(),
      exactRoles: ['admin']
    },
    {
      id: 'role-management',
      label: 'Role Management',
      path: '/admin/roles',
      icon: '🔐',
      show: can.viewRoles(),
      exactRoles: ['admin']
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: '📝',
      show: can.viewAuditLogs(),
      exactRoles: ['admin', 'compliance']
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      path: '/admin/settings/general',
      icon: '🛠️',
      show: can.viewSystemSettings(),
      exactRoles: ['admin']
    },

    // Profile - Available to all authenticated users
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: '👤',
      show: true, // Always show profile
      universal: true // Available to all roles
    }
  ];

  // Filter navigation items based on permissions and role restrictions
  const visibleNavItems = navItems.filter(item => {
    // Skip if item should not be shown based on permissions
    if (!item.show) return false;

    // If item specifies exact roles, check if user has one of them
    if (item.exactRoles && item.exactRoles.length > 0) {
      const hasExactRole = item.exactRoles.some(role => {
        switch (role) {
          case 'admin': return isAdmin;
          case 'compliance': return isCompliance;
          case 'manager': return isManager;
          case 'users': return isRegularUser;
          default: return false;
        }
      });
      if (!hasExactRole) return false;
    }

    // If item specifies excluded roles, check if user doesn't have them
    if (item.excludeRoles && item.excludeRoles.length > 0) {
      const hasExcludedRole = item.excludeRoles.some(role => {
        switch (role) {
          case 'admin': return isAdmin;
          case 'compliance': return isCompliance;
          case 'manager': return isManager;
          case 'users': return isRegularUser;
          default: return false;
        }
      });
      if (hasExcludedRole) return false;
    }

    return true;
  });

  // Navigation item component
  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path ||
                     (item.path !== '/' && location.pathname.startsWith(item.path));

    const baseClasses = `
      flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
      hover:bg-gray-100 hover:text-gray-900
    `;

    const activeClasses = isActive
      ? 'bg-blue-100 text-blue-700 font-semibold'
      : 'text-gray-700';

    return (
      <Link
        to={item.path}
        className={`${baseClasses} ${activeClasses}`}
        title={item.label}
      >
        <span className="text-lg" role="img" aria-label={item.label}>
          {item.icon}
        </span>
        <span>{item.label}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </Link>
    );
  };

  // Render navigation
  return (
    <nav className={`${className} ${vertical ? 'space-y-1' : 'flex space-x-1'}`}>
      {visibleNavItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
};

// Higher-order component for wrapping components with permission-based visibility
export const WithPermissions = ({ children, permissions = [], roles = [], excludeRoles = [] }) => {
  const { hasPermission, hasRole } = usePermissions();

  // Check permissions
  const hasRequiredPermissions = permissions.length === 0 ||
    permissions.some(permission => hasPermission(permission));

  // Check roles
  const hasRequiredRoles = roles.length === 0 ||
    roles.some(role => hasRole(role));

  // Check excluded roles
  const hasExcludedRoles = excludeRoles.length > 0 &&
    excludeRoles.some(role => hasRole(role));

  // Show component if permissions and roles match, and no excluded roles
  const shouldShow = hasRequiredPermissions && hasRequiredRoles && !hasExcludedRoles;

  return shouldShow ? children : null;
};

// Permission-based button component
export const PermissionButton = ({
  children,
  permission,
  role,
  excludeRoles = [],
  fallback = null,
  ...props
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const hasRequiredPermission = !permission || hasPermission(permission);
  const hasRequiredRole = !role || hasRole(role);
  const hasExcludedRole = excludeRoles.length > 0 && excludeRoles.some(r => hasRole(r));

  if (!hasRequiredPermission || !hasRequiredRole || hasExcludedRole) {
    return fallback;
  }

  return <button {...props}>{children}</button>;
};

export default PermissionBasedNav;
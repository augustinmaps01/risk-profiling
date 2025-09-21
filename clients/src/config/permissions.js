/**
 * Centralized Permission Configuration
 *
 * This file defines all permission-based access controls for the application.
 * Instead of hardcoding role checks, components should use permission-based access.
 */

// Core permissions (matching backend permission slugs)
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view-users',
  MANAGE_USERS: 'manage-users',

  // Role Management
  VIEW_ROLES: 'view-roles',
  MANAGE_ROLES: 'manage-roles',

  // Permission Management
  VIEW_PERMISSIONS: 'view-permissions',
  MANAGE_PERMISSIONS: 'manage-permissions',

  // Customer Management
  VIEW_CUSTOMERS: 'view-customers',
  MANAGE_CUSTOMERS: 'manage-customers',

  // Risk Assessment
  VIEW_RISK_ASSESSMENTS: 'view-risk-assessments',
  CREATE_RISK_ASSESSMENTS: 'create-risk-assessments',
  EDIT_RISK_ASSESSMENTS: 'edit-risk-assessments',
  DELETE_RISK_ASSESSMENTS: 'delete-risk-assessments',

  // Risk Settings
  VIEW_RISK_SETTINGS: 'view-risk-settings',
  MANAGE_RISK_SETTINGS: 'manage-risk-settings',

  // Dashboard & Analytics
  VIEW_BASIC_DASHBOARD: 'view-basic-dashboard',
  VIEW_ADMIN_DASHBOARD: 'view-admin-dashboard',
  VIEW_BRANCH_ANALYTICS: 'view-branch-analytics',
  VIEW_SYSTEM_ANALYTICS: 'view-system-analytics',

  // Reports
  VIEW_BASIC_REPORTS: 'view-basic-reports',
  VIEW_ADVANCED_REPORTS: 'view-advanced-reports',
  EXPORT_REPORTS: 'export-reports',

  // System Settings
  VIEW_SYSTEM_SETTINGS: 'view-system-settings',
  MANAGE_SYSTEM_SETTINGS: 'manage-system-settings',

  // Audit Logs
  VIEW_AUDIT_LOGS: 'view-audit-logs',
  MANAGE_AUDIT_LOGS: 'manage-audit-logs',

  // Branch Management
  VIEW_BRANCHES: 'view-branches',
  MANAGE_BRANCHES: 'manage-branches',
};

// Role-based permission mappings (for backward compatibility and easy reference)
export const ROLE_PERMISSIONS = {
  admin: [
    // Full system access
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_RISK_ASSESSMENTS,
    PERMISSIONS.CREATE_RISK_ASSESSMENTS,
    PERMISSIONS.EDIT_RISK_ASSESSMENTS,
    PERMISSIONS.DELETE_RISK_ASSESSMENTS,
    PERMISSIONS.VIEW_RISK_SETTINGS,
    PERMISSIONS.MANAGE_RISK_SETTINGS,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.VIEW_BRANCH_ANALYTICS,
    PERMISSIONS.VIEW_SYSTEM_ANALYTICS,
    PERMISSIONS.VIEW_ADVANCED_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_AUDIT_LOGS,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.MANAGE_BRANCHES,
  ],

  compliance: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_RISK_ASSESSMENTS,
    PERMISSIONS.CREATE_RISK_ASSESSMENTS,
    PERMISSIONS.EDIT_RISK_ASSESSMENTS,
    PERMISSIONS.VIEW_RISK_SETTINGS,
    PERMISSIONS.MANAGE_RISK_SETTINGS,
    PERMISSIONS.VIEW_BASIC_DASHBOARD,
    PERMISSIONS.VIEW_BRANCH_ANALYTICS,
    PERMISSIONS.VIEW_ADVANCED_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_BRANCHES,
  ],

  manager: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_RISK_ASSESSMENTS,
    PERMISSIONS.EDIT_RISK_ASSESSMENTS,
    PERMISSIONS.VIEW_BASIC_DASHBOARD,
    PERMISSIONS.VIEW_BRANCH_ANALYTICS,
    PERMISSIONS.VIEW_BASIC_REPORTS,
    PERMISSIONS.VIEW_BRANCHES,
  ],

  users: [
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_RISK_ASSESSMENTS,
    PERMISSIONS.CREATE_RISK_ASSESSMENTS,
    PERMISSIONS.EDIT_RISK_ASSESSMENTS,
  ],
};

// UI Feature Permissions - Maps UI features to required permissions
export const UI_PERMISSIONS = {
  // Dashboard features
  DASHBOARD_BASIC: [PERMISSIONS.VIEW_BASIC_DASHBOARD],
  DASHBOARD_ADMIN: [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
  DASHBOARD_RISK_DISTRIBUTION: [PERMISSIONS.VIEW_BRANCH_ANALYTICS],
  DASHBOARD_BRANCH_STATS: [PERMISSIONS.VIEW_BRANCH_ANALYTICS],
  DASHBOARD_SYSTEM_OVERVIEW: [PERMISSIONS.VIEW_SYSTEM_ANALYTICS],

  // Navigation menu items
  NAV_DASHBOARD: [PERMISSIONS.VIEW_BASIC_DASHBOARD],
  NAV_RISK_ASSESSMENT: [PERMISSIONS.CREATE_RISK_ASSESSMENTS],
  NAV_CUSTOMERS: [PERMISSIONS.VIEW_CUSTOMERS],
  NAV_SETTINGS: [PERMISSIONS.VIEW_RISK_SETTINGS],
  NAV_USERS: [PERMISSIONS.VIEW_USERS],
  NAV_ROLES: [PERMISSIONS.VIEW_ROLES],
  NAV_PERMISSIONS: [PERMISSIONS.VIEW_PERMISSIONS],
  NAV_REPORTS: [PERMISSIONS.VIEW_BASIC_REPORTS],
  NAV_ADVANCED_REPORTS: [PERMISSIONS.VIEW_ADVANCED_REPORTS],
  NAV_AUDIT_LOGS: [PERMISSIONS.VIEW_AUDIT_LOGS],
  NAV_SYSTEM_SETTINGS: [PERMISSIONS.VIEW_SYSTEM_SETTINGS],

  // Action buttons
  BTN_CREATE_USER: [PERMISSIONS.MANAGE_USERS],
  BTN_EDIT_USER: [PERMISSIONS.MANAGE_USERS],
  BTN_DELETE_USER: [PERMISSIONS.MANAGE_USERS],
  BTN_CREATE_ROLE: [PERMISSIONS.MANAGE_ROLES],
  BTN_EDIT_ROLE: [PERMISSIONS.MANAGE_ROLES],
  BTN_DELETE_ROLE: [PERMISSIONS.MANAGE_ROLES],
  BTN_CREATE_PERMISSION: [PERMISSIONS.MANAGE_PERMISSIONS],
  BTN_EDIT_PERMISSION: [PERMISSIONS.MANAGE_PERMISSIONS],
  BTN_DELETE_PERMISSION: [PERMISSIONS.MANAGE_PERMISSIONS],
  BTN_MANAGE_CUSTOMER: [PERMISSIONS.MANAGE_CUSTOMERS],
  BTN_EXPORT_DATA: [PERMISSIONS.EXPORT_REPORTS],

  // Data sections
  SECTION_USER_LIST: [PERMISSIONS.VIEW_USERS],
  SECTION_ROLE_LIST: [PERMISSIONS.VIEW_ROLES],
  SECTION_PERMISSION_LIST: [PERMISSIONS.VIEW_PERMISSIONS],
  SECTION_CUSTOMER_LIST: [PERMISSIONS.VIEW_CUSTOMERS],
  SECTION_BRANCH_ANALYTICS: [PERMISSIONS.VIEW_BRANCH_ANALYTICS],
  SECTION_SYSTEM_STATS: [PERMISSIONS.VIEW_SYSTEM_ANALYTICS],
  SECTION_AUDIT_LOGS: [PERMISSIONS.VIEW_AUDIT_LOGS],
};

// Route-based permissions
export const ROUTE_PERMISSIONS = {
  // Admin routes - accessible only by admin role
  '/admin/dashboard': [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
  '/admin/users': [PERMISSIONS.VIEW_USERS],
  '/admin/users/create': [PERMISSIONS.MANAGE_USERS],
  '/admin/roles': [PERMISSIONS.VIEW_ROLES],
  '/admin/permissions': [PERMISSIONS.VIEW_PERMISSIONS],
  '/admin/settings/general': [PERMISSIONS.VIEW_SYSTEM_SETTINGS],
  '/admin/settings/security': [PERMISSIONS.MANAGE_SYSTEM_SETTINGS],
  '/admin/audit-logs': [PERMISSIONS.VIEW_AUDIT_LOGS],
  '/admin/reports/activity': [PERMISSIONS.VIEW_ADVANCED_REPORTS],

  // Role-specific routes - admin cannot access these
  '/dashboard': [PERMISSIONS.VIEW_BASIC_DASHBOARD],
  '/customers': [PERMISSIONS.VIEW_CUSTOMERS],
  '/risk-form': [PERMISSIONS.CREATE_RISK_ASSESSMENTS],
  '/risk-settings': [PERMISSIONS.VIEW_RISK_SETTINGS],
  '/reports': [PERMISSIONS.VIEW_BASIC_REPORTS],
};

// Role-exclusive routes - admin should NOT access these
export const ROLE_EXCLUSIVE_ROUTES = {
  '/dashboard': ['compliance', 'manager'], // Only compliance and managers
  '/customers': ['users', 'manager', 'compliance'], // Regular users, managers, and compliance
  '/customers/*/edit': ['users', 'manager', 'compliance'], // Regular users, managers, and compliance can edit via user routes
  '/risk-form': ['users'], // Only regular users
  // /risk-settings removed - admin should have access via permissions
  '/reports': ['compliance'], // Only compliance officers
};

// Helper function to check if user has any of the required permissions
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
};

// Helper function to check if user has all required permissions
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
};

// Helper function to get permissions for a role
export const getRolePermissions = (roleSlug) => {
  return ROLE_PERMISSIONS[roleSlug] || [];
};

// Helper function to check route access
export const canAccessRoute = (userPermissions, userRoles, route) => {
  // Check if this is a role-exclusive route (exact match first)
  let exclusiveRoles = ROLE_EXCLUSIVE_ROUTES[route];

  // If no exact match, check for pattern matches
  if (!exclusiveRoles) {
    for (const [pattern, roles] of Object.entries(ROLE_EXCLUSIVE_ROUTES)) {
      if (pattern.includes('*')) {
        // Convert pattern to regex (e.g., '/customers/*/edit' becomes /^\/customers\/[^\/]+\/edit$/)
        const regexPattern = pattern
          .replace(/\*/g, '[^/]+')
          .replace(/\//g, '\\/');
        const regex = new RegExp(`^${regexPattern}$`);

        if (regex.test(route)) {
          exclusiveRoles = roles;
          break;
        }
      }
    }
  }

  if (exclusiveRoles) {
    // Admin cannot access role-exclusive routes
    if (userRoles.includes('admin')) {
      return false;
    }
    // Only specified roles can access
    return exclusiveRoles.some(role => userRoles.includes(role));
  }

  // Check permission-based access
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions) return true; // Public route

  return hasAnyPermission(userPermissions, requiredPermissions);
};

// Helper function to check UI feature access
export const canAccessFeature = (userPermissions, featureName) => {
  const requiredPermissions = UI_PERMISSIONS[featureName];
  if (!requiredPermissions) return true; // Public feature

  return hasAnyPermission(userPermissions, requiredPermissions);
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  UI_PERMISSIONS,
  ROUTE_PERMISSIONS,
  ROLE_EXCLUSIVE_ROUTES,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessRoute,
  canAccessFeature,
};
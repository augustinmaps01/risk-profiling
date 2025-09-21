import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS, ROUTE_PERMISSIONS, ROLE_EXCLUSIVE_ROUTES } from '../../config/permissions';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/constants';

/**
 * Permission Testing Component
 *
 * This component allows administrators to test permission-based functionality
 * and validate role-based access control throughout the application.
 */
const PermissionTester = () => {
  const { userPermissions, userRoles, hasPermission, hasRole, canAccessRoute } = usePermissions();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTestUser, setSelectedTestUser] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ROLES);
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USERS);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Test scenarios for different functionalities
  const testScenarios = [
    {
      category: 'User Management',
      tests: [
        {
          name: 'View Users',
          permission: PERMISSIONS.VIEW_USERS,
          description: 'Test ability to view user list',
          expectedRoles: ['admin'],
        },
        {
          name: 'Manage Users',
          permission: PERMISSIONS.MANAGE_USERS,
          description: 'Test ability to create/edit/delete users',
          expectedRoles: ['admin'],
        },
      ],
    },
    {
      category: 'Role Management',
      tests: [
        {
          name: 'View Roles',
          permission: PERMISSIONS.VIEW_ROLES,
          description: 'Test ability to view role list',
          expectedRoles: ['admin'],
        },
        {
          name: 'Manage Roles',
          permission: PERMISSIONS.MANAGE_ROLES,
          description: 'Test ability to create/edit/delete roles',
          expectedRoles: ['admin'],
        },
      ],
    },
    {
      category: 'Customer Management',
      tests: [
        {
          name: 'View Customers',
          permission: PERMISSIONS.VIEW_CUSTOMERS,
          description: 'Test ability to view customer list',
          expectedRoles: ['admin', 'compliance', 'manager', 'users'],
        },
        {
          name: 'Manage Customers',
          permission: PERMISSIONS.MANAGE_CUSTOMERS,
          description: 'Test ability to manage customer data',
          expectedRoles: ['admin', 'compliance', 'manager'],
        },
      ],
    },
    {
      category: 'Risk Management',
      tests: [
        {
          name: 'Create Risk Assessments',
          permission: PERMISSIONS.CREATE_RISK_ASSESSMENTS,
          description: 'Test ability to create risk assessments',
          expectedRoles: ['admin', 'compliance', 'manager', 'users'],
        },
        {
          name: 'View Risk Settings',
          permission: PERMISSIONS.VIEW_RISK_SETTINGS,
          description: 'Test ability to view risk settings',
          expectedRoles: ['admin', 'compliance'],
        },
        {
          name: 'Manage Risk Settings',
          permission: PERMISSIONS.MANAGE_RISK_SETTINGS,
          description: 'Test ability to manage risk settings',
          expectedRoles: ['admin', 'compliance'],
        },
      ],
    },
    {
      category: 'Dashboard Access',
      tests: [
        {
          name: 'View Basic Dashboard',
          permission: PERMISSIONS.VIEW_BASIC_DASHBOARD,
          description: 'Test access to standard dashboard',
          expectedRoles: ['compliance', 'manager'],
        },
        {
          name: 'View Admin Dashboard',
          permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD,
          description: 'Test access to admin dashboard',
          expectedRoles: ['admin'],
        },
      ],
    },
  ];

  // Route tests for role-exclusive access
  const routeTests = [
    {
      route: '/dashboard',
      description: 'Standard Dashboard',
      allowedRoles: ['compliance', 'manager'],
      excludedRoles: ['admin', 'users'],
    },
    {
      route: '/admin/dashboard',
      description: 'Admin Dashboard',
      allowedRoles: ['admin'],
      excludedRoles: ['compliance', 'manager', 'users'],
    },
    {
      route: '/risk-form',
      description: 'Risk Assessment Form',
      allowedRoles: ['users'],
      excludedRoles: ['admin', 'compliance', 'manager'],
    },
    {
      route: '/risk-settings',
      description: 'Risk Settings',
      allowedRoles: ['admin', 'compliance'],
      excludedRoles: ['manager', 'users'],
    },
  ];

  const runPermissionTests = () => {
    setIsRunningTests(true);
    const results = [];

    // Test permissions for selected role
    testScenarios.forEach((scenario) => {
      scenario.tests.forEach((test) => {
        const shouldHaveAccess = test.expectedRoles.includes(selectedRole);
        const hasAccess = simulatePermissionCheck(test.permission, selectedRole);

        results.push({
          category: scenario.category,
          testName: test.name,
          description: test.description,
          expectedAccess: shouldHaveAccess,
          actualAccess: hasAccess,
          passed: shouldHaveAccess === hasAccess,
          type: 'permission',
        });
      });
    });

    // Test route access
    routeTests.forEach((routeTest) => {
      const shouldHaveAccess = routeTest.allowedRoles.includes(selectedRole);
      const hasAccess = simulateRouteAccess(routeTest.route, selectedRole);

      results.push({
        category: 'Route Access',
        testName: routeTest.description,
        description: `Access to ${routeTest.route}`,
        expectedAccess: shouldHaveAccess,
        actualAccess: hasAccess,
        passed: shouldHaveAccess === hasAccess,
        type: 'route',
        route: routeTest.route,
      });
    });

    setTestResults(results);
    setIsRunningTests(false);
  };

  // Simulate permission check for a given role
  const simulatePermissionCheck = (permission, role) => {
    // Admin has all permissions except role-exclusive routes
    if (role === 'admin') return true;

    // Map roles to their permissions based on your permission config
    const rolePermissions = {
      compliance: [
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
      ],
      manager: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_RISK_ASSESSMENTS,
        PERMISSIONS.CREATE_RISK_ASSESSMENTS,
        PERMISSIONS.EDIT_RISK_ASSESSMENTS,
        PERMISSIONS.VIEW_BASIC_DASHBOARD,
        PERMISSIONS.VIEW_BRANCH_ANALYTICS,
        PERMISSIONS.VIEW_BASIC_REPORTS,
      ],
      users: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.VIEW_RISK_ASSESSMENTS,
        PERMISSIONS.CREATE_RISK_ASSESSMENTS,
        PERMISSIONS.EDIT_RISK_ASSESSMENTS,
      ],
    };

    return rolePermissions[role]?.includes(permission) || false;
  };

  // Simulate route access for a given role
  const simulateRouteAccess = (route, role) => {
    // Check role-exclusive routes
    const exclusiveRoles = ROLE_EXCLUSIVE_ROUTES[route];
    if (exclusiveRoles) {
      return exclusiveRoles.includes(role);
    }

    // Check permission-based routes
    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (requiredPermissions) {
      return requiredPermissions.some(permission => simulatePermissionCheck(permission, role));
    }

    return true; // Public route
  };

  const getTestStatusIcon = (passed) => {
    if (passed) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else {
      return <XCircleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getTestStatusColor = (passed) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  const passedTests = testResults.filter(test => test.passed).length;
  const failedTests = testResults.filter(test => !test.passed).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Permission & Access Control Tester
        </h3>
        <p className="text-gray-600">
          Test role-based permissions and route access control to validate system security.
        </p>
      </div>

      {/* Test Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="admin">Admin</option>
            <option value="compliance">Compliance</option>
            <option value="manager">Manager</option>
            <option value="users">Regular User</option>
          </select>
        </div>
        <div className="flex items-end">
          <motion.button
            onClick={runPermissionTests}
            disabled={isRunningTests}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRunningTests ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                Run Tests
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Tests</p>
                <p className="text-xl font-semibold text-gray-900">{testResults.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-500">Passed</p>
                <p className="text-xl font-semibold text-green-900">{passedTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-500">Failed</p>
                <p className="text-xl font-semibold text-red-900">{failedTests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      <AnimatePresence>
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h4 className="text-md font-semibold text-gray-900">Test Results for: {selectedRole}</h4>

            {/* Group results by category */}
            {Object.entries(
              testResults.reduce((acc, test) => {
                if (!acc[test.category]) acc[test.category] = [];
                acc[test.category].push(test);
                return acc;
              }, {})
            ).map(([category, tests]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <h5 className="text-sm font-medium text-gray-900">{category}</h5>
                </div>
                <div className="divide-y divide-gray-200">
                  {tests.map((test, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTestStatusIcon(test.passed)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{test.testName}</p>
                          <p className="text-xs text-gray-500">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-xs">
                          <span className="text-gray-500">Expected: </span>
                          <span className={test.expectedAccess ? 'text-green-600' : 'text-red-600'}>
                            {test.expectedAccess ? 'Allow' : 'Deny'}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Actual: </span>
                          <span className={test.actualAccess ? 'text-green-600' : 'text-red-600'}>
                            {test.actualAccess ? 'Allow' : 'Deny'}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${getTestStatusColor(test.passed)}`}>
                          {test.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current User Permissions Display */}
      <div className="mt-8 border-t pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Current User Permissions & Roles
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Your Roles</h5>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <UserIcon className="w-3 h-3 mr-1" />
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Your Permissions</h5>
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {userPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    <LockClosedIcon className="w-3 h-3 mr-1" />
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionTester;
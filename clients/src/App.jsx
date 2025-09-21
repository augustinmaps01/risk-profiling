import React, { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppLayout } from "./layouts";
import AdminLayout from "./layouts/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { SystemSettingsProvider } from "./contexts/SystemSettingsContext";
import { ProtectedRoute } from "./components/auth";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";
import ForcePasswordChangeWrapper from "./components/auth/ForcePasswordChangeWrapper";
import { configureAxios } from "./services/axiosInterceptor";
import { LoadingSpinner } from "./components/ui";
import { PERMISSIONS } from "./config/permissions";

// Regular user pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RiskAssessmentPage = lazy(() => import("./pages/RiskAssessmentPage"));
const RiskSettings = lazy(() => import("./pages/RiskSettings"));
const CustomerListPage = lazy(() =>
  import("./pages/customers/CustomerListPage")
);
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Admin pages
const AdminDashboardDirect = lazy(() => import("./pages/admin/AdminDashboard"));
const PermissionDebug = lazy(() => import("./pages/admin/PermissionDebug"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const PermissionManagement = lazy(() =>
  import("./pages/admin/PermissionManagement")
);
const GeneralSettings = lazy(() => import("./pages/admin/GeneralSettings"));
const SecuritySettings = lazy(() => import("./pages/admin/SecuritySettings"));
const UserActivityReport = lazy(() =>
  import("./pages/admin/UserActivityReport")
);
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const EditRiskAssessmentPage = lazy(() =>
  import("./pages/EditRiskAssessmentPage")
);

function App() {
  // Initialize axios configuration
  useEffect(() => {
    configureAxios();
  }, []);

  return (
    <SystemSettingsProvider>
      <AuthProvider>
        <Router>
          <ForcePasswordChangeWrapper>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Auth routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />


                {/* Admin routes - MUST be first to ensure proper matching */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboardDirect />} />
                  <Route path="debug" element={<PermissionDebug />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="roles" element={<RoleManagement />} />
                  <Route
                    path="permissions"
                    element={<PermissionManagement />}
                  />
                  <Route
                    path="branches"
                    element={<div>Branch Management - Coming Soon</div>}
                  />
                  <Route
                    path="branches/analytics"
                    element={<div>Branch Analytics - Coming Soon</div>}
                  />
                  <Route
                    path="risk-assessment"
                    element={<RiskAssessmentPage />}
                  />
                  <Route path="customers" element={<CustomerListPage />} />
                  <Route
                    path="customers/:id/edit"
                    element={<EditRiskAssessmentPage />}
                  />
                  <Route path="risk-settings" element={<RiskSettings />} />
                  <Route
                    path="reports/risk"
                    element={<div>Risk Reports - Coming Soon</div>}
                  />
                  <Route
                    path="reports/activity"
                    element={<UserActivityReport />}
                  />
                  <Route
                    path="reports/compliance"
                    element={<div>Compliance Reports - Coming Soon</div>}
                  />
                  <Route
                    path="reports/export"
                    element={<div>Export Tools - Coming Soon</div>}
                  />
                  <Route
                    path="settings/general"
                    element={<GeneralSettings />}
                  />
                  <Route
                    path="settings/security"
                    element={<SecuritySettings />}
                  />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<AdminDashboardDirect />} />
                </Route>

                {/* Protected main app routes - Permission-based access */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.VIEW_BASIC_DASHBOARD}
                    >
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}
                    >
                      <AppLayout>
                        <CustomerListPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/risk-form"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.CREATE_RISK_ASSESSMENTS}
                    >
                      <AppLayout>
                        <RiskAssessmentPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/risk-settings"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.VIEW_RISK_SETTINGS}
                    >
                      <AppLayout>
                        <RiskSettings />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.VIEW_BASIC_REPORTS}
                    >
                      <AppLayout>
                        <div className="p-8 text-center">
                          Reports Page - Coming Soon
                        </div>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProfilePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/customers/:id/edit"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.EDIT_RISK_ASSESSMENTS}
                    >
                      <AppLayout>
                        <EditRiskAssessmentPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers/:id/edit"
                  element={
                    <ProtectedRoute
                      requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}
                    >
                      <AppLayout>
                        <EditRiskAssessmentPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route for authenticated users */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <RoleBasedRedirect />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </ForcePasswordChangeWrapper>
        </Router>
      </AuthProvider>
    </SystemSettingsProvider>
  );
}

export default App;

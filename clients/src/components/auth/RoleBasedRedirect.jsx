import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const { hasRole, getDashboardRoute } = usePermissions();

  // Determine redirect path based on user role
  if (!user) {
    return <div>Loading...</div>;
  }

  console.log('RoleBasedRedirect - User:', user);
  console.log('RoleBasedRedirect - User roles:', user?.roles);
  console.log('RoleBasedRedirect - hasRole admin:', hasRole('admin'));
  console.log('RoleBasedRedirect - hasRole compliance:', hasRole('compliance'));
  console.log('RoleBasedRedirect - hasRole manager:', hasRole('manager'));

  const redirectPath = getDashboardRoute();

  console.log('RoleBasedRedirect - Final redirect path:', redirectPath);

  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedRedirect;
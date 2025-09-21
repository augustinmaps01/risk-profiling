import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TokenStatus = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();

  // Simple token status without JWT decoding
  const hasToken = () => {
    return !!localStorage.getItem('authToken');
  };

  if (!isAuthenticated || !hasToken()) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-green-600">
          Active
        </span>
      </div>
      <span className="text-gray-500 text-xs">
        12-hour session
      </span>
    </div>
  );
};

export default TokenStatus;
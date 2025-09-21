import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";
import { successAlert, errorAlert } from "../../utils/sweetAlertConfig";

const EditRequestNotifications = () => {
  const { hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Only show for managers
  if (!hasRole('manager')) {
    return null;
  }

  const fetchPendingRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(API_ENDPOINTS.MANAGER_PENDING_REQUESTS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.data.success) {
        const newRequests = response.data.data;
        const previousCount = pendingRequests.length;
        setPendingRequests(newRequests);

        // Logic for badge visibility:
        // 1. If no requests, hide badge
        // 2. If dropdown is open, don't show badge (user is viewing)
        // 3. If there are new requests compared to before, show badge
        // 4. If there are requests but dropdown was never opened, show badge
        if (newRequests.length === 0) {
          setHasUnreadNotifications(false);
        } else if (!isOpen) {
          // Only show badge when dropdown is closed and there are requests
          if (newRequests.length > previousCount || hasUnreadNotifications) {
            setHasUnreadNotifications(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [isOpen]); // Add isOpen as dependency to handle state changes

  // Reset unread state when dropdown opens
  useEffect(() => {
    if (isOpen && pendingRequests.length > 0) {
      setHasUnreadNotifications(false);
    }
  }, [isOpen, pendingRequests.length]);

  const handleAction = async (requestId, action, notes = '') => {
    setActionLoading(requestId);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        API_ENDPOINTS.MANAGER_UPDATE_REQUEST_STATUS(requestId),
        {
          status: action,
          manager_notes: notes || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        successAlert(
          action === 'approved' ? 'Request Approved' : 'Request Disapproved',
          response.data.message
        );

        // Remove the request from the list
        const updatedRequests = pendingRequests.filter(req => req.id !== requestId);
        setPendingRequests(updatedRequests);

        // Update badge state based on remaining requests
        if (updatedRequests.length === 0) {
          setHasUnreadNotifications(false);
        }
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      errorAlert(
        "Action Failed",
        error.response?.data?.message || "Failed to update request status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickAction = (requestId, action) => {
    handleAction(requestId, action);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Mark notifications as read when opening the dropdown
          if (!isOpen && pendingRequests.length > 0) {
            setHasUnreadNotifications(false);
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
        title="Edit Requests"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0"
          />
        </svg>

        {/* Badge */}
        {pendingRequests.length > 0 && hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Requests
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-6 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All edit requests have been handled.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg
                                  className="h-4 w-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {request.user_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.user_email}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                Wants to edit: <span className="font-medium">{request.customer_name}</span>
                              </p>
                              {request.reason && (
                                <p className="text-xs text-gray-600 mt-1 italic">
                                  "{request.reason}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {request.created_at}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleQuickAction(request.id, 'approved')}
                          disabled={actionLoading === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Processing...
                            </div>
                          ) : (
                            'Approve'
                          )}
                        </button>
                        <button
                          onClick={() => handleQuickAction(request.id, 'disapproved')}
                          disabled={actionLoading === request.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Processing...
                            </div>
                          ) : (
                            'Disapprove'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default EditRequestNotifications;
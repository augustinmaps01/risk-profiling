import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import sessionManager from '../../services/sessionManager';

const SessionStatus = () => {
  const { isAuthenticated, user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInactivityDialog, setShowInactivityDialog] = useState(false);
  const [autoLogoutCountdown, setAutoLogoutCountdown] = useState(5);
  const autoLogoutTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTimeRemaining(0);
      setShowInactivityDialog(false);
      return;
    }

    const updateTimer = () => {
      const remaining = sessionManager.getTimeUntilLogout();
      setTimeRemaining(remaining);
      
      // Show inactivity dialog when 30 seconds remaining (instead of 2 minutes)
      if (remaining > 0 && remaining <= 30 * 1000 && !showInactivityDialog) {
        setShowInactivityDialog(true);
        startAutoLogoutCountdown();
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      clearAutoLogoutTimers();
    };
  }, [isAuthenticated, showInactivityDialog]);

  const startAutoLogoutCountdown = () => {
    setAutoLogoutCountdown(5);
    
    countdownTimerRef.current = setInterval(() => {
      setAutoLogoutCountdown((prev) => {
        if (prev <= 1) {
          // Auto logout when countdown reaches 0
          sessionManager.autoLogout('inactivity');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearAutoLogoutTimers = () => {
    if (autoLogoutTimerRef.current) {
      clearTimeout(autoLogoutTimerRef.current);
      autoLogoutTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const handleStayLoggedIn = async () => {
    clearAutoLogoutTimers();
    const success = await sessionManager.refreshSession();
    if (success) {
      setShowInactivityDialog(false);
      setAutoLogoutCountdown(5);
    }
  };

  const handleLogoutNow = () => {
    clearAutoLogoutTimers();
    sessionManager.autoLogout('user_requested');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Inactivity Dialog */}
      {showInactivityDialog && (
        <div className="inactivity-overlay">
          <div className="inactivity-dialog">
            <div className="dialog-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Session Timeout Warning</h3>
            </div>
            <div className="dialog-content">
              <p>You've been inactive for a while.</p>
              <p>You will be automatically logged out in <strong>{autoLogoutCountdown}</strong> seconds.</p>
            </div>
            <div className="dialog-actions">
              <button 
                onClick={handleStayLoggedIn}
                className="stay-logged-btn"
              >
                <i className="fas fa-user-check"></i>
                Stay Logged In
              </button>
              <button 
                onClick={handleLogoutNow}
                className="logout-now-btn"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden - no visible session status */}
      
      <style>{`
        .inactivity-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .inactivity-dialog {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
          margin: 20px;
          animation: slideIn 0.3s ease-out;
        }

        .dialog-header {
          background: #f8d7da;
          border-radius: 12px 12px 0 0;
          padding: 20px 24px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dialog-header i {
          color: #721c24;
          font-size: 24px;
        }

        .dialog-header h3 {
          margin: 0;
          color: #721c24;
          font-size: 18px;
          font-weight: 600;
        }

        .dialog-content {
          padding: 24px;
          text-align: center;
        }

        .dialog-content p {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 16px;
          line-height: 1.4;
        }

        .dialog-content p:last-child {
          margin-bottom: 0;
          font-size: 18px;
        }

        .dialog-content strong {
          color: #dc3545;
          font-size: 22px;
          font-weight: 700;
        }

        .dialog-actions {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .stay-logged-btn, .logout-now-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-width: 140px;
          justify-content: center;
        }

        .stay-logged-btn {
          background: #28a745;
          color: white;
        }

        .stay-logged-btn:hover {
          background: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }

        .logout-now-btn {
          background: #6c757d;
          color: white;
        }

        .logout-now-btn:hover {
          background: #5a6268;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .dialog-actions {
            flex-direction: column;
          }
          
          .stay-logged-btn, .logout-now-btn {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default SessionStatus;
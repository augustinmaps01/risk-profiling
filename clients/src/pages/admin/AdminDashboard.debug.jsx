import React, { useState, useEffect } from "react";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminDashboard Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '2px solid red', margin: '20px' }}>
          <h2 style={{ color: 'red' }}>🚨 Component Error Detected!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (click to expand)</summary>
            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
            <br/>
            <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminDashboard = () => {
  console.log('🔄 AdminDashboard: Component starting to render');

  const [renderState, setRenderState] = useState('initializing');
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 AdminDashboard: useEffect triggered');
    setRenderState('mounting');

    try {
      // Simulate the component lifecycle
      setTimeout(() => {
        console.log('🔄 AdminDashboard: Simulated data loading complete');
        setRenderState('loaded');
        setLoading(false);
        setDebugInfo({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          location: window.location.href
        });
      }, 1000);

    } catch (err) {
      console.error('🚨 AdminDashboard: Error in useEffect:', err);
      setError(err.message);
      setRenderState('error');
      setLoading(false);
    }
  }, []);

  console.log('🔄 AdminDashboard: Current render state:', renderState, 'Loading:', loading);

  // Loading state
  if (loading) {
    console.log('🔄 AdminDashboard: Rendering loading state');
    return (
      <div style={{ padding: '20px', backgroundColor: '#e3f2fd', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', paddingTop: '50px' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#1976d2' }}>
            🔄 Loading Admin Dashboard...
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            State: {renderState}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('🚨 AdminDashboard: Rendering error state');
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>❌ Dashboard Error</h2>
        <p style={{ color: '#d32f2f' }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', backgroundColor: '#c62828', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Main content - this is where the blank issue might be
  console.log('🟢 AdminDashboard: Rendering main content');

  try {
    return (
      <ErrorBoundary>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          {/* Success Header */}
          <div style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>
              ✅ ADMIN DASHBOARD IS WORKING!
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
              Component successfully rendered without errors
            </p>
          </div>

          {/* Debug Information */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🔍 Debug Information</h3>
            <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
              <div><strong>Render State:</strong> {renderState}</div>
              <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
              <div><strong>Error:</strong> {error || 'none'}</div>
              <div><strong>Timestamp:</strong> {debugInfo.timestamp || 'not set'}</div>
            </div>
          </div>

          {/* Sample Dashboard Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ backgroundColor: '#2196f3', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Total Customers</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Demo data</div>
            </div>

            <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Low Risk</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Safe customers</div>
            </div>

            <div style={{ backgroundColor: '#ff9800', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Moderate Risk</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Monitoring required</div>
            </div>

            <div style={{ backgroundColor: '#f44336', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>High Risk</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Immediate attention</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Actions</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  console.log('🔄 Refresh button clicked');
                  window.location.reload();
                }}
                style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔄 Refresh Page
              </button>

              <button
                onClick={() => {
                  console.log('🐛 Debug button clicked');
                  alert('Component is working! Check console for detailed logs.');
                }}
                style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🐛 Test Alert
              </button>

              <button
                onClick={() => {
                  console.log('📊 Console log button clicked');
                  console.table({
                    'Component State': renderState,
                    'Loading': loading,
                    'Error': error || 'none',
                    'Debug Info': JSON.stringify(debugInfo)
                  });
                }}
                style={{ padding: '10px 20px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                📊 Console Log
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#e8f5e8',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
              🎉 If you can see this, the AdminDashboard component is working correctly!
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('🚨 AdminDashboard: Caught error in render:', err);
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>❌ Render Error</h2>
        <p style={{ color: '#d32f2f' }}>Component failed to render: {err.message}</p>
      </div>
    );
  }
};

export default AdminDashboard;
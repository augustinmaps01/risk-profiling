import React from "react";

const MinimalDashboard = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'green', fontSize: '24px', marginBottom: '20px' }}>
        🟢 MINIMAL DASHBOARD IS WORKING!
      </h1>

      <p style={{ color: 'black', marginBottom: '10px' }}>
        If you can see this, the routing is working fine.
      </p>

      <p style={{ color: 'blue', marginBottom: '20px' }}>
        The issue is in the complex AdminDashboard component or its imports.
      </p>

      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '15px',
        border: '1px solid #ccc',
        marginBottom: '20px'
      }}>
        <h3>Debugging Info:</h3>
        <ul>
          <li>✅ React component rendering</li>
          <li>✅ Component export/import working</li>
          <li>✅ Route matching successful</li>
          <li>✅ No syntax errors in this component</li>
        </ul>
      </div>

      <button
        onClick={() => alert('Button works!')}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default MinimalDashboard;
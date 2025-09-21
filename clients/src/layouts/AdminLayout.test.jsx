import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayoutTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <h1>🔧 ADMIN LAYOUT TEST</h1>
        <p>If you see this, the AdminLayout routing is working!</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>Page Content:</h2>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayoutTest;
import React from "react";

const AdminDashboardTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Admin Dashboard - Test Mode
      </h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h2 className="font-semibold text-green-800">✅ Dashboard is Loading!</h2>
        <p className="text-green-700 text-sm mt-1">
          This is a simplified version to test if the issue was in the complex AdminDashboard component.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Status</h3>
          <p className="text-gray-600">Admin dashboard is working!</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Steps</h3>
          <p className="text-gray-600">Check the original AdminDashboard.jsx for issues</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Actions</h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Debugging Information</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• React component is rendering correctly</li>
          <li>• No import/export errors</li>
          <li>• Tailwind CSS classes are working</li>
          <li>• JavaScript execution is normal</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardTest;
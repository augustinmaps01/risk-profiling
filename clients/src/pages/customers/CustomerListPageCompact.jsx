import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import axios from "axios";
import { getRiskColor } from "../../utils/riskUtils";
import { API_BASE_URL } from "../../config/constants";
import { GlobalFilter, CustomerTable, Pagination } from "../../components/table";
import { Card, LoadingSpinner } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useCustomerData, useCustomerFilters } from "../../hooks/useCustomerData";
import { useCustomerExport } from "../../hooks/useCustomerExport";
import CustomerFilters from "../../components/customers/CustomerFilters";
import CustomerDetailsModal from "../../components/customers/CustomerDetailsModal";

export default function CustomerListPage() {
  const { user } = useAuth();
  const { customers, loading, error } = useCustomerData();
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const canViewBranches = user?.roles?.some(role => role.slug === 'compliance' || role.slug === 'admin');
  const { filteredCustomers, filters, handleFilterChange, handleClearFilters } = useCustomerFilters(customers, canViewBranches);
  const { exportToCSV, exportToExcel, exportToPDF } = useCustomerExport();

  useEffect(() => {
    if (!canViewBranches) return;
    setLoadingBranches(true);
    const token = localStorage.getItem("authToken");
    axios.get('branches/dropdown', {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    })
    .then((res) => {
      if (res.data.success) {
        setBranches(res.data.data.filter((branch) => branch.value !== 1));
      }
      setLoadingBranches(false);
    })
    .catch(() => setLoadingBranches(false));
  }, [canViewBranches]);

  const handleViewDetails = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  }, []);

  const columns = useMemo(() => [
    { accessorKey: "name", header: "Customer Name", cell: (info) => <div className="font-medium text-slate-900">{info.getValue()}</div> },
    { accessorKey: "date_created", header: "Date Created", cell: (info) => <div className="text-sm"><div className="font-medium text-slate-900">{info.getValue()}</div><div className="text-slate-500">{info.row.original.time_created}</div></div> },
    { accessorKey: "totalScore", header: "Total Score", cell: (info) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{info.getValue()}</span> },
    { accessorKey: "riskLevel", header: "Risk Level", cell: (info) => { const risk = info.getValue(); const colorClass = getRiskColor(risk); const bgClass = risk === "HIGH RISK" ? "bg-red-100" : risk === "MODERATE RISK" ? "bg-yellow-100" : "bg-green-100"; return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${colorClass}`}>{risk}</span>; } },
    { id: "actions", header: "Actions", cell: (info) => <button onClick={() => handleViewDetails(info.row.original)} className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"><svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>View</button> },
  ], [handleViewDetails]);

  const table = useReactTable({
    data: filteredCustomers, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    filterFns: { includesString: (row, columnId, filterValue) => String(row.getValue(columnId)).toLowerCase().includes(filterValue.toLowerCase()) },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8"><LoadingSpinner size="lg" text="Loading customer data..." /></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Backend API Connection Failed</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-slate-600 mb-6">
            <p>Please ensure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your Laravel backend is running on port 8001</li>
              <li>The API endpoint `/api/customers-list` is accessible</li>
              <li>You have proper authentication tokens if required</li>
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <CustomerFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleClearFilters={handleClearFilters}
        filteredCustomers={filteredCustomers}
        isComplianceOfficer={canViewBranches}
        branches={branches}
        loadingBranches={loadingBranches}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        GlobalFilter={GlobalFilter}
      />
      <Card className="overflow-hidden">
        <CustomerTable table={table} columns={columns} />
      </Card>
      <div className="mt-6">
        <Pagination table={table} />
      </div>
      <CustomerDetailsModal
        showDetailsModal={showDetailsModal}
        selectedCustomer={selectedCustomer}
        setShowDetailsModal={setShowDetailsModal}
        exportToCSV={exportToCSV}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        handlePrint={() => console.log("Print functionality")}
      />
    </div>
  );
}
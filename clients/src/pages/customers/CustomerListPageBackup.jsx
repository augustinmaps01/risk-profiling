import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../../assets/rbt-logo.png.png";
import { getRiskColor } from "../../utils/riskUtils";
import { API_BASE_URL } from "../../config/constants";
import {
  GlobalFilter,
  CustomerTable,
  Pagination,
} from "../../components/table";
import { Card, LoadingSpinner, Button } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";

export default function CustomerListPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    riskLevel: "",
    search: "",
    branchId: "",
  });

  // Check if user is compliance officer
  const isComplianceOfficer = user?.roles?.some(role => role.slug === 'compliance');

  // Data fetching from backend only
  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");

    axios
      .get('customers-list', {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch customers:", err.message);
        setError(`Failed to connect to backend API: ${err.message}`);
        setCustomers([]);
        setLoading(false);
      });
  }, []);

  // Fetch branches for compliance officers
  useEffect(() => {
    if (!isComplianceOfficer) return;

    setLoadingBranches(true);
    const token = localStorage.getItem("authToken");

    axios
      .get('branches/dropdown', {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => {
        if (res.data.success) {
          // Filter out Head Office (id: 1)
          const filteredBranches = res.data.data.filter(
            (branch) => branch.value !== 1
          );
          setBranches(filteredBranches);
        }
        setLoadingBranches(false);
      })
      .catch((err) => {
        console.error("Error fetching branches", err);
        setLoadingBranches(false);
      });
  }, [isComplianceOfficer]);

  const handleViewDetails = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      riskLevel: "",
      search: "",
      branchId: "",
    });
  }, []);

  // Apply filters to customers data
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    if (filters.search) {
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.riskLevel) {
      filtered = filtered.filter(
        (customer) => customer.riskLevel === filters.riskLevel
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (customer) => customer.date_created >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (customer) => customer.date_created <= filters.dateTo
      );
    }

    // Branch filter for compliance officers
    if (filters.branchId && isComplianceOfficer) {
      filtered = filtered.filter((customer) => {
        const customerBranchId = customer.branch_id;
        const selectedBranchId = parseInt(filters.branchId);
        return customerBranchId === selectedBranchId;
      });
    }

    return filtered;
  }, [customers, filters, isComplianceOfficer]);

  // Export functions for modal
  const exportModalDataToCSV = () => {
    if (!selectedCustomer) return;
    const dataToExport = selectedCustomer.selections.flatMap((criteria) =>
      criteria.options.map((opt) => ({
        Name: selectedCustomer.name,
        Criteria: criteria.criteriaCategory,
        "Sub-Criteria": opt.optionLabel,
        Points: opt.points,
        "Total Score": selectedCustomer.totalScore,
        "Risk Level": selectedCustomer.riskLevel,
      }))
    );
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCustomer.name}_details.csv`;
    a.click();
  };

  const exportModalDataToExcel = () => {
    if (!selectedCustomer) return;
    const dataToExport = selectedCustomer.selections.flatMap((criteria) =>
      criteria.options.map((opt) => ({
        Name: selectedCustomer.name,
        Criteria: criteria.criteriaCategory,
        "Sub-Criteria": opt.optionLabel,
        Points: opt.points,
        "Total Score": selectedCustomer.totalScore,
        "Risk Level": selectedCustomer.riskLevel,
      }))
    );
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Details");
    XLSX.writeFile(wb, `${selectedCustomer.name}_details.xlsx`);
  };

  const exportModalDataToPDF = (customer) => {
    // Check for a valid customer object at the start
    if (!customer || !customer.selections || customer.selections.length === 0) {
      console.error(
        "PDF export failed: No valid customer data or selections found."
      );
      return;
    }

    const doc = new jsPDF();
    doc.text(`Customer Assessment for: ${customer.name}`, 14, 20);

    const tableColumn = ["Criteria", "Sub-Criteria", "Points"];
    const tableRows = customer.selections.flatMap((criteria) =>
      criteria.options.map((opt, j) => [
        j === 0 ? criteria.criteriaCategory : "",
        opt.optionLabel,
        `${opt.points} pts`,
      ])
    );

    const finalY = doc.autoTable.previous.finalY;

    doc.setFontSize(12);
    doc.text(`Total Score: ${customer.totalScore} pts`, 14, finalY + 10);
    doc.text(`Risk Level: ${customer.riskLevel}`, 14, finalY + 16);

    doc.save(`${customer.name}_details.pdf`);
  };

  const handlePrint = () => {
    if (!selectedCustomer) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return; // Handle cases where pop-ups are blocked

    const getRiskColorClass = (risk) => {
      if (risk === "HIGH RISK") return "risk-high";
      if (risk === "MODERATE RISK") return "risk-moderate";
      return "risk-low";
    };
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const printHtml = `
    <html>
  <head>

<style>
  .logo {
      width: 80px; /* Adjust as needed */
      height: auto;
      margin-bottom: 10px; /* Add some space below the logo */
      display: block; /* Ensures the image is on its own line */
      margin-left: auto;
      margin-right: auto;
        }

  @page {
    size: A4;
    margin: 1cm;
    /* These rules are the key to removing headers/footers in most browsers */
    @top-left { content: none; }
    @top-center { content: none; }
    @top-right { content: none; }
    @bottom-left { content: none; }
    @bottom-center { content: none; }
    @bottom-right { content: none; }
  }

  /*
   * Fallback for some older browsers and a more direct
   * approach to try and override the browser's default.
   */
  @page {
    margin-top: 0;
    margin-bottom: 0;
  }
  @page :left {
    margin-left: 0;
    margin-right: 0;
  }
  @page :right {
    margin-left: 0;
    margin-right: 0;
  }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 1rem;
    color: #333;
    line-height: 1.6;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: white;
  }
  .container {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: white;
  }
  header h5 {
    text-align: center;
    margin-bottom: 1rem;
    font-weight:normal;
    font-size:18px
  }
  h1 {
    color: #1e40af;
    font-size: 24px;
    margin: 0;
  }
  h4 {
    text-align: left;
    margin: 0.5rem 0 0.3rem;
    color: black;
    font-size: 18px;
    padding-bottom: 0.3rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden; /* Ensures rounded corners on the table */
  }
  th, td {
    border: 1px solid #464646;
    padding: 8px 12px;
    text-align: left;
    font-size: 13px;
  }
  thead th {
    background-color: #fbfcff; /* Reverted to professional blue */
    color: #121212; /* Set font color to white for contrast */
    font-weight: bold; /* Set font weight to bold */
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  tbody tr {
    color: #000000; /* Set all tbody text to black */
    text-align:center;
  }
  tbody tr:nth-child(even) {
    background-color: #f9fafb;
  }
  tbody td:first-child {
    font-weight: 500;
    color: #1e40af;
  }
  tfoot {
    font-weight: bold;
    background-color: #eef2ff; /* Light blue footer background */
  }
  tfoot td {
     border: 1px solid #464646;
    font-size: 14px;
    color: black;
  }


  .risk-high { color: #dc2626; font-weight: bold; }
  .risk-moderate { color: #ca8a04; font-weight: bold; }
  .risk-low { color: #16a34a; font-weight: bold; }
  @media print {
    body {
      margin: 0 !important;
      padding: 1cm !important;
      font-size: 10pt;
      display: block !important;
      min-height: auto !important;
    }
    .container {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 1rem !important;
      box-shadow: none !important;
      border: 2px solid #000 !important;
      border-radius: 0 !important;
    }
    table {
      box-shadow: none !important;
    }
    h1 {
      font-size: 20pt !important;
    }
    h4 {
      font-size: 14pt !important;
    }
    th, td {
      padding: 6px 8px !important;
      font-size: 9pt !important;
    }
    tfoot td {
      font-size: 10pt !important;
    }
  }
header {
  /* Use a flexbox on the main header for overall centering */
  display: flex;
  justify-content: center; /* Horizontally centers the flex-container inside */
  align-items: center; /* Vertically centers the flex-container inside */
}



.logo {
  /* Remove auto margins, as flexbox handles alignment */
  margin: 0;
  width: 60px; /* Keep your desired logo size */
  height: auto;
}

.header-text {
  /* Remove text alignment from the text block itself */
  text-align: left;
}

.header-text h5 {
  /* Remove default margins for h5 to prevent extra spacing */
  margin: 0;
}

</style>
  </head>
  <body>
    <div class="container">
        
      <header>
        <div>
          <img style = "margin:0 auto;" src="${Logo}" alt="RBT Bank Logo" class="logo" />
          <div class="header-text">
            <h5>RBT BANK INC., A Rural Bank</h5>
            <h5>Talisayan, Misamis Oriental, Philippines</h5>
            <h5 style="margin-top: 5px; font-size:16px;">${currentDate}</h5>
             <br> <br>
            <h1 style="text-align: center; color:black; margin-top:25px;">CLIENT RISK PROFILE</h1>
          </div>
        </div>

      </header>
      <div> 
        <h4 style="text-align: left; padding:0;margin-bottom:3px; line-height: 1.6;">Name: ${
          selectedCustomer.name
        }</h4>
        <h5 style="text-align: left; padding:0; margin:0; font-size:16px">Date Assessed: ${
          selectedCustomer.created_at
            ? new Date(selectedCustomer.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
        }</h5>
      </div>


      <table>
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Sub-Criteria</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${selectedCustomer.selections
            .map((criteria) =>
              criteria.options
                .map(
                  (opt, j) => `
                    <tr>
                      ${
                        j === 0
                          ? `<td style = "color:black; font-weight:normal;" rowspan="${criteria.options.length}">${criteria.criteriaCategory}</td>`
                          : ""
                      }
                      <td>${opt.optionLabel}</td>
                      <td style = "text-align:center">${opt.points} </td>
                    </tr>
                  `
                )
                .join("")
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td  colspan="2">Total Score</td>
            <td style = "text-align:center;">${selectedCustomer.totalScore}</td>
          </tr>
          <tr style = "font-size:10px;">
            <td colspan="2">Risk Level</td>
            <td class="${getRiskColorClass(selectedCustomer.riskLevel)}">${
      selectedCustomer.riskLevel
    }</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </body>
</html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Customer Name",
        cell: (info) => (
          <div className="font-medium text-slate-900">{info.getValue()}</div>
        ),
        filterFn: "includesString",
      },
      {
        accessorKey: "date_created",
        header: "Date Created",
        cell: (info) => (
          <div className="text-sm">
            <div className="font-medium text-slate-900">{info.getValue()}</div>
            <div className="text-slate-500">
              {info.row.original.time_created}
            </div>
          </div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "totalScore",
        header: "Total Score",
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {info.getValue()}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "riskLevel",
        header: "Risk Level",
        cell: (info) => {
          const risk = info.getValue();
          const colorClass = getRiskColor(risk);
          const bgClass =
            risk === "HIGH RISK"
              ? "bg-red-100"
              : risk === "MODERATE RISK"
              ? "bg-yellow-100"
              : "bg-green-100";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${colorClass}`}
            >
              {risk}
            </span>
          );
        },
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        enableColumnFilter: false,
        cell: (info) => (
          <button
            onClick={() => handleViewDetails(info.row.original)}
            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>
        ),
      },
    ],
    [handleViewDetails]
  );

  const table = useReactTable({
    data: filteredCustomers,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      includesString: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      },
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8">
          <LoadingSpinner size="lg" text="Loading customer data..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Backend API Connection Failed
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-slate-600 mb-6">
            <p>Please ensure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your Laravel backend is running on port 8001</li>
              <li>The API endpoint `/api/customers-list` is accessible</li>
              <li>You have proper authentication tokens if required</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Filter Controls Section */}
      <Card className="p-6 mb-8">
        <div className="space-y-6">
          {/* Search Row */}
          <div className="flex justify-start items-center">
            <div className="flex-1 max-w-md">
              <GlobalFilter
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="border-t pt-6">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isComplianceOfficer ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search by Name
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Enter customer name..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) =>
                    handleFilterChange("riskLevel", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Risk Levels</option>
                  <option value="LOW RISK">Low Risk</option>
                  <option value="MODERATE RISK">Moderate Risk</option>
                  <option value="HIGH RISK">High Risk</option>
                </select>
              </div>

              {/* Branch Filter - Only show for compliance officers */}
              {isComplianceOfficer && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Branch
                  </label>
                  <select
                    value={filters.branchId}
                    onChange={(e) =>
                      handleFilterChange("branchId", e.target.value)
                    }
                    disabled={loadingBranches}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingBranches ? "Loading branches..." : "All Branches"}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-slate-600">
                {filteredCustomers.length} customer
                {filteredCustomers.length !== 1 ? "s" : ""} found
              </div>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <CustomerTable table={table} columns={columns} />
      </Card>

      {/* Pagination Section */}
      <div className="mt-6">
        <Pagination table={table} />
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <AnimatePresence>
          {showDetailsModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background Overlay */}
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setShowDetailsModal(false);
                }}
              />

              {/* Modal Content */}
              <motion.div
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col z-10"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Modal Header - Fixed */}
                <div className="flex-shrink-0 p-4 sm:p-6 md:p-8 lg:p-10 pb-2 sm:pb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 text-blue-700 pr-8">
                    Name: {selectedCustomer.name}
                  </h2>

                  {/* Export buttons */}
                  <div className="flex flex-wrap justify-center sm:justify-end gap-1 sm:gap-2 md:gap-3 my-2 sm:my-4">
                    <button
                      onClick={exportModalDataToCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-md text-xs sm:text-sm transition duration-300 flex-1 sm:flex-initial min-w-[60px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">Export </span>CSV
                    </button>
                    <button
                      onClick={exportModalDataToExcel}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-md text-xs sm:text-sm transition duration-300 flex-1 sm:flex-initial min-w-[60px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">Export </span>Excel
                    </button>
                    <button
                      onClick={() => exportModalDataToPDF(selectedCustomer)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-md text-xs sm:text-sm transition duration-300 flex-1 sm:flex-initial min-w-[60px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">Export </span>PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-md text-xs sm:text-sm transition duration-300 flex-1 sm:flex-initial min-w-[60px] sm:min-w-0"
                    >
                      Print
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                {selectedCustomer.selections && (
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-4 sm:pb-6 md:pb-8 lg:pb-10">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-blue-700 text-center">
                      Client Risk Profile
                    </h3>
                    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-600 text-white">
                          <tr>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider w-1/3">
                              Criteria
                            </th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider w-1/2">
                              Sub-Criteria
                            </th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6">
                              Points
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedCustomer.selections.map((criteria, i) =>
                            criteria.options.map((opt, j) => (
                              <tr
                                key={`${i}-${j}`}
                                className="hover:bg-gray-50"
                              >
                                {j === 0 && (
                                  <td
                                    rowSpan={criteria.options.length}
                                    className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-medium text-gray-900 border-r border-gray-200 align-top w-1/3"
                                  >
                                    <div className="break-words">
                                      {criteria.criteriaCategory}
                                    </div>
                                  </td>
                                )}
                                <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-500 w-1/2">
                                  <div className="break-words">
                                    {opt.optionLabel}
                                  </div>
                                </td>
                                <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-500 w-1/6">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {opt.points} pts
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="bg-gray-500 text-white">
                          <tr>
                            <td
                              colSpan={2}
                              className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold uppercase"
                            >
                              Total Score
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold">
                              <span className="bg-white text-gray-900 px-1.5 sm:px-2 py-1 rounded font-bold">
                                {selectedCustomer.totalScore} pts
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold uppercase"
                            >
                              Risk Level
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold">
                              <span
                                className={`px-1.5 sm:px-2 py-1 rounded font-bold ${getRiskColor(
                                  selectedCustomer.riskLevel
                                )}`}
                              >
                                {selectedCustomer.riskLevel}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

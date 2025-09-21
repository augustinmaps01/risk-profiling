import React from 'react';
import { motion } from 'framer-motion';

const BranchSelector = ({ 
  selectedBranch, 
  setSelectedBranch, 
  branches, 
  loadingBranches, 
  isComplianceOfficer, 
  isRegularUser, 
  user, 
  error 
}) => {
  if (isComplianceOfficer) {
    return <ComplianceBranchSelect 
      selectedBranch={selectedBranch}
      setSelectedBranch={setSelectedBranch}
      branches={branches}
      loadingBranches={loadingBranches}
      error={error}
    />;
  }

  if (isRegularUser && user?.branch) {
    return <UserBranchDisplay user={user} />;
  }

  return null;
};

const ComplianceBranchSelect = ({ 
  selectedBranch, 
  setSelectedBranch, 
  branches, 
  loadingBranches, 
  error 
}) => (
  <div className="relative mt-4">
    <div className="relative">
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={loadingBranches}
        className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500 appearance-none cursor-pointer ${
          error && !selectedBranch
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-white/30 focus:border-white focus:ring-white/20"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <option value="" className="text-slate-500">
          {loadingBranches ? "Loading branches..." : "Select branch"}
        </option>
        {branches.map((branch) => (
          <option
            key={branch.value}
            value={branch.value}
            className="text-slate-800"
          >
            {branch.branch_name}
          </option>
        ))}
      </select>

      <DropdownIndicator 
        selectedBranch={selectedBranch} 
        loadingBranches={loadingBranches} 
      />
    </div>

    <BranchHelperText />
  </div>
);

const DropdownIndicator = ({ selectedBranch, loadingBranches }) => (
  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
    {selectedBranch ? (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
    ) : (
      <svg
        className={`w-5 h-5 transition-colors duration-200 ${
          loadingBranches ? "text-slate-400 animate-spin" : "text-slate-400"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {loadingBranches ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        )}
      </svg>
    )}
  </div>
);

const BranchHelperText = () => (
  <div className="mt-2 flex items-center text-white/70 text-xs">
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-3a1 1 0 011-1h4a1 1 0 011 1v3M9 21h6"
      />
    </svg>
    <span>Choose the branch for this customer assessment</span>
  </div>
);

const UserBranchDisplay = ({ user }) => (
  <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
    <p className="text-white/80 text-sm">
      Branch:{" "}
      <span className="font-medium text-white">
        {user.branch.display_name ||
          `${user.branch.branch_name} (${user.branch.brak})`}
      </span>
    </p>
  </div>
);

export default BranchSelector;
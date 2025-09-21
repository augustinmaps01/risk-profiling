import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../ui';
import BranchSelector from './BranchSelector';

const WelcomeStep = ({ 
  name, 
  setName, 
  selectedBranch, 
  setSelectedBranch, 
  branches, 
  loadingBranches, 
  isComplianceOfficer, 
  isRegularUser, 
  user, 
  error, 
  onNext 
}) => {
  return (
    <motion.div
      key="name-step"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedCard
        className="p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-2xl md:max-w-6xl lg:max-w-6xl xl:max-w-6xl mx-auto w-full"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          color: "white",
        }}
      >
        <div className="text-center">
          <WelcomeIcon />
          <WelcomeHeader />
          <CustomerNameInput 
            name={name} 
            setName={setName} 
            error={error} 
            onNext={onNext} 
          />
          
          <BranchSelector
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            branches={branches}
            loadingBranches={loadingBranches}
            isComplianceOfficer={isComplianceOfficer}
            isRegularUser={isRegularUser}
            user={user}
            error={error}
          />

          {error && <ErrorMessage error={error} />}
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

const WelcomeIcon = () => (
  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
    <svg
      className="w-10 h-10 text-white"
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
);

const WelcomeHeader = () => (
  <>
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center break-words">
      Welcome!
    </h2>
    <p className="text-white/80 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base text-center">
      Let's start by getting the customer's information
    </p>
  </>
);

const CustomerNameInput = ({ name, setName, error, onNext }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Enter customer name"
      className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          : "border-white/30 focus:border-white focus:ring-white/20"
      }`}
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && onNext()}
    />
    {name && (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
      >
        <svg
          className="w-6 h-6 text-green-500"
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
    )}
  </div>
);

const ErrorMessage = ({ error }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg"
  >
    <p className="text-red-100 font-medium">{error}</p>
  </motion.div>
);

export default WelcomeStep;
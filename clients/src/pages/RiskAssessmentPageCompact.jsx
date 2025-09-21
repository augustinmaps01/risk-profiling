import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useRiskAssessment, useBranchManagement } from "../hooks";
import {
  WelcomeStep,
  CriteriaStep,
  ResultModal,
  AssessmentNavigation,
} from "../components/riskAssessment";

const RiskAssessmentPage = () => {
  const { user } = useAuth();

  // Business logic hooks
  const {
    criteria,
    responses,
    result,
    isLoading,
    handleSelect,
    submitAssessment,
    resetAssessment,
  } = useRiskAssessment();
  const {
    selectedBranch,
    setSelectedBranch,
    branches,
    loadingBranches,
    isComplianceOfficer,
    isRegularUser,
  } = useBranchManagement(user);

  // UI state
  const [name, setName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Computed values
  const isWelcomeStep = currentStep === 0;
  const isLastStep = currentStep === criteria.length;
  const currentCriteria = isWelcomeStep ? null : criteria[currentStep - 1];

  // Validation
  const validate = () => {
    if (isWelcomeStep) {
      if (!name.trim()) return setError("Customer name is required.");
      if (isComplianceOfficer && !selectedBranch)
        return setError("Please select a branch.");
    } else if (currentCriteria && !responses[currentCriteria.id]) {
      return setError("Please select an option before proceeding.");
    }
    setError("");
    return true;
  };

  // Navigation
  const handleNext = () => {
    if (!validate()) return;

    if (isWelcomeStep) {
      setCurrentStep(1);
      setCompletedStepsCount(1);
    } else if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
      setCompletedStepsCount((prev) => Math.max(prev, currentStep + 1));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    const result = await submitAssessment(name, selectedBranch);
    if (result.success) setShowModal(true);
  };

  const handleStartNew = () => {
    resetAssessment();
    setName("");
    setCurrentStep(0);
    setCompletedStepsCount(0);
    setError("");
    setShowModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="relative">
          <AnimatePresence mode="wait">
            {isWelcomeStep ? (
              <WelcomeStep
                name={name}
                setName={setName}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                branches={branches}
                loadingBranches={loadingBranches}
                isComplianceOfficer={isComplianceOfficer}
                isRegularUser={isRegularUser}
                user={user}
                error={error}
                onNext={handleNext}
              />
            ) : (
              currentCriteria && (
                <CriteriaStep
                  criteria={currentCriteria}
                  responses={responses}
                  onSelect={handleSelect}
                  error={error}
                />
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      <AssessmentNavigation
        currentStep={currentStep}
        totalSteps={criteria.length}
        completedStepsCount={completedStepsCount}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <ResultModal
        isOpen={showModal}
        result={result}
        onClose={() => setShowModal(false)}
        onStartNew={handleStartNew}
      />
    </div>
  );
};

export default RiskAssessmentPage;

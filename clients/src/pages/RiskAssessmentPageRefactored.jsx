import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useRiskAssessment from '../hooks/useRiskAssessment';
import useBranchManagement from '../hooks/useBranchManagement';
import WelcomeStep from '../components/riskAssessment/WelcomeStep';
import CriteriaStep from '../components/riskAssessment/CriteriaStep';
import ResultModal from '../components/riskAssessment/ResultModal';
import AssessmentNavigation from '../components/riskAssessment/AssessmentNavigation';

const RiskAssessmentPage = () => {
  const { user } = useAuth();
  
  // Custom hooks for business logic
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

  // Local UI state
  const [name, setName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Computed values
  const totalSteps = criteria.length;
  const isWelcomeStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps;
  const currentCriteria = isWelcomeStep ? null : criteria[currentStep - 1];

  // Navigation handlers
  const handleNext = () => {
    if (isWelcomeStep) {
      if (!validateWelcomeStep()) return;
      setCurrentStep(1);
      setCompletedStepsCount(1);
    } else {
      if (!validateCriteriaStep()) return;
      
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
        setCompletedStepsCount(prev => Math.max(prev, currentStep + 1));
      }
    }
    
    setError('');
    scrollToTop();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError('');
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;

    const result = await submitAssessment(name, selectedBranch);
    if (result.success) {
      setShowModal(true);
    }
  };

  const handleStartNew = () => {
    resetAssessment();
    setName('');
    setCurrentStep(0);
    setCompletedStepsCount(0);
    setError('');
    setShowModal(false);
    scrollToTop();
  };

  // Validation functions
  const validateWelcomeStep = () => {
    if (!name.trim()) {
      setError('Customer name is required.');
      return false;
    }

    if (isComplianceOfficer && !selectedBranch) {
      setError('Please select a branch.');
      return false;
    }

    return true;
  };

  const validateCriteriaStep = () => {
    if (!currentCriteria) return true;
    
    if (!responses[currentCriteria.id]) {
      setError('Please select an option before proceeding.');
      return false;
    }
    
    return true;
  };

  const validateSubmission = () => {
    const allAnswered = criteria.every(criterion => responses[criterion.id]);
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return false;
    }
    return true;
  };

  // Utility functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 pb-32">
        <AssessmentContent
          isWelcomeStep={isWelcomeStep}
          currentCriteria={currentCriteria}
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
          responses={responses}
          onSelect={handleSelect}
          onNext={handleNext}
        />
      </div>

      <AssessmentNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
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

const AssessmentContent = ({
  isWelcomeStep,
  currentCriteria,
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
  responses,
  onSelect,
  onNext,
}) => (
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
          onNext={onNext}
        />
      ) : (
        currentCriteria && (
          <CriteriaStep
            criteria={currentCriteria}
            responses={responses}
            onSelect={onSelect}
            error={error}
          />
        )
      )}
    </AnimatePresence>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600 text-lg">Loading assessment...</p>
    </div>
  </div>
);

export default RiskAssessmentPage;
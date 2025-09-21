import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Button,
  ProgressBar,
  StepIndicator,
  AnimatedCard,
} from "../components/ui";
import {
  confirmationAlert,
  successAlert,
  errorAlert,
  infoAlert,
} from "../utils/sweetAlertConfig";
import { useAuth } from "../contexts/AuthContext";
import { riskSettingsService } from "../services/riskSettingsService";

export default function EditRiskAssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, hasRole } = useAuth();

  // Helper function to get role-based endpoints
  const getAssessmentEndpoints = () => {
    if (hasRole('admin')) {
      return {
        CRITERIA: API_ENDPOINTS.ADMIN_CRITERIA,
        CUSTOMERS: API_ENDPOINTS.CUSTOMERS,
        UPDATE_CUSTOMER: (id) => `admin/customers/${id}`,
      };
    } else if (hasRole('manager')) {
      return {
        CRITERIA: API_ENDPOINTS.MANAGER_CRITERIA,
        CUSTOMERS: API_ENDPOINTS.MANAGER_CUSTOMERS,
        UPDATE_CUSTOMER: (id) => `manager/customers/${id}`,
      };
    } else {
      return {
        CRITERIA: API_ENDPOINTS.CRITERIA,
        CUSTOMERS: 'user/customers',
        UPDATE_CUSTOMER: (id) => `user/customers/${id}`,
      };
    }
  };

  const [criteria, setCriteria] = useState([]);
  const [responses, setResponses] = useState({});
  const [originalResponses, setOriginalResponses] = useState({});
  const [selectionConfig, setSelectionConfig] = useState({});
  const [riskThresholds, setRiskThresholds] = useState({
    low_threshold: 10,
    moderate_threshold: 16,
    high_threshold: 19
  });
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState(null);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has permission to edit
  useEffect(() => {
    const checkEditPermission = async () => {
      // Admin and managers always have access
      if (hasRole('admin') || hasRole('manager')) {
        return;
      }

      // For regular users, check if they have approved access for this specific customer
      if (hasRole('users') && id) {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(API_ENDPOINTS.CHECK_EDIT_ACCESS(id), {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          if (response.data.success && response.data.can_edit) {
            return; // User has approved access
          }
        } catch (error) {
          console.error("Error checking edit access:", error);
        }
      }

      // If we reach here, user doesn't have permission
      errorAlert("Access Denied", "You don't have permission to edit this risk assessment. Please request access from your manager.");
      const redirectPath = hasRole('admin') ? "/admin/customers" : "/customers";
      navigate(redirectPath);
    };

    checkEditPermission();
  }, [hasRole, navigate, id]);

  // Load customer data and criteria
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    // Load customer data, criteria, selection configuration, and risk thresholds
    const endpoints = getAssessmentEndpoints();
    Promise.all([
      axios.get(`${endpoints.CUSTOMERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      axios.get(endpoints.CRITERIA, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      // Fetch selection configuration using service
      riskSettingsService.selectionConfig.getAll(),
      // Fetch risk thresholds
      riskSettingsService.riskThresholds.get()
    ])
    .then(([customerRes, criteriaRes, configRes, thresholdsRes]) => {
      if (customerRes.data.success) {
        const customerData = customerRes.data.data;
        setCustomer(customerData);
        setName(customerData.name);

        // Convert responses array to object format and pre-populate answers
        // The responses array contains option IDs, we need to map them to criteria
        const responseObj = {};
        if (customerData.responses && Array.isArray(customerData.responses) && criteriaRes.data) {
          // Create a map of option ID to criteria ID for quick lookup
          const optionToCriteriaMap = {};
          criteriaRes.data.forEach(criteria => {
            criteria.options.forEach(option => {
              optionToCriteriaMap[option.id] = criteria.id;
            });
          });

          // Map customer responses to criteria (handle both single and multiple selection)
          customerData.responses.forEach(optionId => {
            const criteriaId = optionToCriteriaMap[optionId];
            if (criteriaId) {
              const isMultiple = (configRes.data || {})[criteriaId] === 'multiple';
              if (isMultiple) {
                // For multiple selection, store as array
                if (!responseObj[criteriaId]) {
                  responseObj[criteriaId] = [];
                }
                responseObj[criteriaId].push(optionId);
              } else {
                // For single selection, store as single value (existing behavior)
                responseObj[criteriaId] = optionId;
              }
            }
          });
        }
        setResponses(responseObj);
        setOriginalResponses(responseObj);

        // Count completed steps for progress
        const completedCount = Object.keys(responseObj).length;
        setCompletedStepsCount(completedCount);
      }

      setCriteria(criteriaRes.data);
      setSelectionConfig(configRes.data || {});
      setRiskThresholds(thresholdsRes.data || {
        low_threshold: 10,
        moderate_threshold: 16,
        high_threshold: 19
      });
      setIsLoading(false);
    })
    .catch((err) => {
      console.error("Error loading data:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 403) {
        errorAlert("Access Denied", "You don't have permission to edit this risk assessment.");
        const redirectPath = hasRole('admin') ? "/admin/customers" : "/customers";
        navigate(redirectPath);
      } else if (err.response?.status === 500) {
        errorAlert("Server Error", "There was a server error. Please try again or contact support.");
      } else if (err.response?.status === 404) {
        errorAlert("Not Found", "This customer assessment was not found.");
        const redirectPath = hasRole('admin') ? "/admin/customers" : "/customers";
        navigate(redirectPath);
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load customer data";
        errorAlert("Error", errorMessage);
      }
      setIsLoading(false);
    });
  }, [id, navigate]);

  const handleSelect = (criteriaId, optionId) => {
    const isMultiple = selectionConfig[criteriaId] === 'multiple';

    if (isMultiple) {
      // Handle multiple selection (checkboxes)
      setResponses((prev) => {
        const currentSelections = prev[criteriaId] || [];
        const isSelected = currentSelections.includes(optionId);

        if (isSelected) {
          // Remove option
          const newSelections = currentSelections.filter(id => id !== optionId);
          return {
            ...prev,
            [criteriaId]: newSelections.length > 0 ? newSelections : undefined
          };
        } else {
          // Add option
          return {
            ...prev,
            [criteriaId]: [...currentSelections, optionId]
          };
        }
      });
      // Don't auto-advance for multiple selection
    } else {
      // Handle single selection (radio buttons) - existing behavior
      setResponses((prev) => ({
        ...prev,
        [criteriaId]: optionId,
      }));
      // Auto-advance to next step after selection
      setTimeout(() => {
        if (currentStep < criteria.length - 1) {
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < criteria.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepIndex) => {
    const criteriaAtStep = criteria[stepIndex];
    return responses[criteriaAtStep?.id] !== undefined;
  };

  useEffect(() => {
    const completed = criteria.filter((_, index) => isStepCompleted(index)).length;
    setCompletedStepsCount(completed);
  }, [responses, criteria]);

  const calculateResult = () => {
    // Flatten responses to handle both single and multiple selections
    const allSelectedOptionIds = Object.values(responses).flatMap(response =>
      Array.isArray(response) ? response : [response]
    );
    let totalScore = 0;

    allSelectedOptionIds.forEach((optionId) => {
      criteria.forEach((criteriaItem) => {
        const option = criteriaItem.options.find((opt) => opt.id == optionId);
        if (option) {
          totalScore += option.points;
        }
      });
    });

    let riskLevel = "LOW RISK";
    if (totalScore >= riskThresholds.high_threshold) {
      riskLevel = "HIGH RISK";
    } else if (totalScore >= riskThresholds.moderate_threshold) {
      riskLevel = "MODERATE RISK";
    }

    return { totalScore, riskLevel, responses: allSelectedOptionIds };
  };

  const handleReview = () => {
    const responseCount = Object.keys(responses).length;
    if (responseCount < criteria.length) {
      errorAlert("Incomplete Assessment",
        `Please answer all questions before reviewing. ${responseCount}/${criteria.length} completed.`);
      return;
    }

    const result = calculateResult();
    setResult(result);
    setShowReviewModal(true);
  };

  const handleUpdateSubmission = async () => {
    const { totalScore, riskLevel, responses: responseValues } = result;

    const hasChanges = JSON.stringify(Object.values(originalResponses).sort()) !==
                     JSON.stringify(responseValues.sort()) ||
                     name !== customer.name;

    if (!hasChanges) {
      infoAlert("No Changes", "No changes were made to this risk assessment.");
      return;
    }

    const confirmed = await confirmationAlert(
      "Update Risk Assessment",
      `Are you sure you want to update this risk assessment?\n\nNew Risk Level: ${riskLevel}\nTotal Score: ${totalScore} points`,
      "Yes, Update",
      "Cancel"
    );

    if (!confirmed) return;

    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const endpoints = getAssessmentEndpoints();
      const response = await axios.put(
        endpoints.UPDATE_CUSTOMER(id),
        {
          name: name,
          responses: responseValues,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        await successAlert(
          "Assessment Updated!",
          `Risk assessment for ${name} has been successfully updated.\nRisk Level: ${riskLevel}\nTotal Score: ${totalScore} points`
        );
        const redirectPath = hasRole('admin') ? "/admin/customers" : "/customers";
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.message || "Failed to update risk assessment";
      errorAlert("Update Failed", errorMessage);
    } finally {
      setIsLoading(false);
      setShowReviewModal(false);
    }
  };

  const getCurrentCriteria = () => criteria[currentStep];
  const currentCriteria = getCurrentCriteria();

  if (!isAdmin) {
    return null;
  }

  if (isLoading && !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  const progress = criteria.length > 0 ? (completedStepsCount / criteria.length) * 100 : 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Fixed Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto px-0 xs:px-1 sm:px-1 md:py-2 lg:px-3 pt-4 pb-8 w-full max-w-4xl xs:max-w-6xl sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none 2xl:max-w-none">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 relative"
        >
          {/* Back Button - Positioned relative to header */}
          <button
            onClick={() => {
              const redirectPath = hasRole('admin') ? "/admin/customers" : "/customers";
              navigate(redirectPath);
            }}
            className="absolute left-0 top-0 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customers
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Edit Risk Assessment
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Modify the risk profile for: <span className="font-semibold text-blue-600">{name}</span>
          </p>

          {/* Step Indicator */}
          {criteria.length > 0 && (
            <div className="mt-8">
              <StepIndicator
                steps={[
                  ...criteria.map((c, i) => ({ name: `Q${i + 1}` })),
                ]}
                currentStep={currentStep}
              />
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Assessment Questions */}
          {currentCriteria && (
            <motion.div
              key={currentStep}
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
                {/* Customer Name Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                {/* Question Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">
                      {currentStep + 1}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center leading-tight">
                    {currentCriteria.category}
                  </h2>
                  <p className="text-blue-100 text-base sm:text-lg opacity-90">
                    {selectionConfig[currentCriteria.id] === 'multiple'
                      ? "Please select all applicable options"
                      : "Please select the most appropriate option"}
                  </p>
                </div>

                {/* Options Grid */}
                <div className={`grid gap-3 sm:gap-4 md:gap-6 mb-8 ${
                  currentCriteria.options?.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 justify-items-center max-w-2xl mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}>
                  {currentCriteria.options?.map((option, index) => {
                    const isMultiple = selectionConfig[currentCriteria.id] === 'multiple';
                    const currentResponse = responses[currentCriteria.id];
                    const isSelected = isMultiple
                      ? Array.isArray(currentResponse) && currentResponse.includes(option.id)
                      : currentResponse == option.id;
                    const cardSize = "h-24 sm:h-28 md:h-32";
                    const cardAspect = "aspect-video";

                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelect(currentCriteria.id, option.id)}
                        className={`cursor-pointer p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm w-full ${cardSize} ${cardAspect} flex flex-col items-center justify-center text-center relative ${
                          isSelected
                            ? "border-green-400 bg-white/20 shadow-lg ring-4 ring-green-400/30"
                            : "border-white/30 bg-white/20 hover:border-white/50 hover:bg-white/30"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                        <span
                          className={`text-sm sm:text-base md:text-lg font-medium break-words word-wrap text-center flex items-center justify-center h-full w-full px-2 py-1 whitespace-normal leading-tight ${
                            isSelected ? "text-green-300" : "text-white"
                          }`}
                        >
                          {option.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="px-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    ← Previous
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleReview}
                      variant="success"
                      className="px-6 bg-green-600 hover:bg-green-700 text-white"
                      disabled={completedStepsCount < criteria.length}
                    >
                      Review Changes
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={currentStep >= criteria.length - 1}
                      className="px-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && result && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Beautiful Background Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowReviewModal(false)}
              />
              {/* Modal Content */}
              <motion.div
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Review Assessment Changes
                  </h2>

                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                        <p className="text-lg font-semibold text-gray-800">{name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Score</p>
                        <p className="text-2xl font-bold text-blue-600">{result.totalScore} {result.totalScore === 0 || result.totalScore === 1 ? 'pt' : 'pts'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                        <p className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                          result.riskLevel === 'HIGH RISK' ? 'bg-red-100 text-red-800' :
                          result.riskLevel === 'MODERATE RISK' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Selected Options</h3>
                    <div className="space-y-4">
                      {criteria.map((criteriaItem) => {
                        const selectedOption = criteriaItem.options.find(
                          (opt) => opt.id == responses[criteriaItem.id]
                        );
                        return selectedOption ? (
                          <div key={criteriaItem.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-1">
                                  {criteriaItem.label}
                                </h4>
                                <p className="text-gray-600">{selectedOption.label}</p>
                              </div>
                              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                                {selectedOption.points} {selectedOption.points === 0 || selectedOption.points === 1 ? 'pt' : 'pts'}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      onClick={() => setShowReviewModal(false)}
                      variant="outline"
                      className="px-8"
                    >
                      Continue Editing
                    </Button>
                    <Button
                      onClick={handleUpdateSubmission}
                      variant="primary"
                      className="px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Update Assessment"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
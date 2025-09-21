import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';
import { successAlert, errorAlert, confirmationAlert } from '../utils/sweetAlertConfig';

const useRiskAssessment = () => {
  const [criteria, setCriteria] = useState([]);
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch criteria on mount
  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await axios.get(API_ENDPOINTS.CRITERIA, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      setCriteria(response.data);
    } catch (error) {
      console.error('Error fetching criteria', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (criteriaId, optionId) => {
    setResponses((prev) => ({
      ...prev,
      [criteriaId]: optionId,
    }));
  };

  const submitAssessment = async (name, branchId) => {
    const allSelectedOptionIds = Object.values(responses);

    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        name,
        responses: allSelectedOptionIds,
      };

      // Only include branch_id if explicitly selected (compliance officers)
      if (branchId) {
        requestData.branch_id = branchId;
      }

      const response = await axios.post(
        API_ENDPOINTS.CREATE_CUSTOMER,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      setResult(response.data);
      await successAlert(
        'Assessment Complete!',
        `Customer ${name} has been assessed with a ${response.data.risk_level} rating.`
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error submitting assessment:', error);
      await errorAlert(
        'Submission Failed!',
        error.response?.data?.message || 'Failed to submit assessment.'
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

  const resetAssessment = () => {
    setResponses({});
    setResult(null);
  };

  return {
    criteria,
    responses,
    result,
    isLoading,
    handleSelect,
    submitAssessment,
    resetAssessment,
  };
};

export default useRiskAssessment;
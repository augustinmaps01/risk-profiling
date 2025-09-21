import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const useBranchManagement = (user) => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const isComplianceOfficer = () => {
    return user?.roles?.some((role) => role.slug === 'compliance');
  };

  const isRegularUser = () => {
    return user?.roles?.some((role) => role.slug === 'users');
  };

  useEffect(() => {
    if (!user) return;

    // For regular users, set their branch automatically
    if (isRegularUser() && user.branch_id) {
      const branchIdStr = user.branch_id.toString();
      if (selectedBranch !== branchIdStr) {
        setSelectedBranch(branchIdStr);
      }
      return;
    }

    // For compliance officers, fetch all branches except Head Office (id: 1)
    if (isComplianceOfficer()) {
      setLoadingBranches(true);
      const token = localStorage.getItem('authToken');

      axios
        .get('branches/dropdown', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
        .then((res) => {
          if (res.data.success) {
            // Filter out Head Office (id: 1) and sort by brcode ASC
            const filteredBranches = res.data.data.filter(
              (branch) => branch.value !== 1
            );
            const sortedBranches = filteredBranches.sort((a, b) => {
              if (a.brcode && b.brcode) {
                return a.brcode.localeCompare(b.brcode);
              }
              return 0;
            });
            setBranches(sortedBranches);
          }
          setLoadingBranches(false);
        })
        .catch((err) => {
          console.error('Error fetching branches', err);
          setLoadingBranches(false);
        });
    }
  }, [user]);

  return {
    selectedBranch,
    setSelectedBranch,
    branches,
    loadingBranches,
    isComplianceOfficer: isComplianceOfficer(),
    isRegularUser: isRegularUser(),
  };
};

export default useBranchManagement;
import axios from 'axios';
import { useCallback, useState } from 'react';

// Custom hook for interacting with Application API
export const useApplicationApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/hr/applications');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching applications');
      setLoading(false);
      throw err;
    }
  }, []);

  const getApplication = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/applications/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching application');
      setLoading(false);
      throw err;
    }
  }, []);

  const getApplicationsByCandidate = useCallback(async (candidateId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/applications/candidate/${candidateId}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching applications by candidate');
      setLoading(false);
      throw err;
    }
  }, []);

  const getApplicationsByJobPosting = useCallback(async (jobPostingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/applications/job-posting/${jobPostingId}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching applications by job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const createApplication = useCallback(async (applicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/hr/applications', applicationData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating application');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateApplication = useCallback(async (id, applicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/applications/${id}`, applicationData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating application');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateApplicationStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/applications/${id}/status`, { status });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating application status');
      setLoading(false);
      throw err;
    }
  }, []);

  const getMatchScore = useCallback(async (candidateId, jobPostingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/applications/${candidateId}/${jobPostingId}/match-score`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating match score');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getApplications,
    getApplication,
    getApplicationsByCandidate,
    getApplicationsByJobPosting,
    createApplication,
    updateApplication,
    updateApplicationStatus,
    getMatchScore,
  };
};
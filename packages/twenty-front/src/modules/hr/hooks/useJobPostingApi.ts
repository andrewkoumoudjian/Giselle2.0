import axios from 'axios';
import { useCallback, useState } from 'react';

// Custom hook for interacting with Job Posting API
export const useJobPostingApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getJobPostings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/hr/job-postings');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching job postings');
      setLoading(false);
      throw err;
    }
  }, []);

  const getActiveJobPostings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/hr/job-postings/active');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching active job postings');
      setLoading(false);
      throw err;
    }
  }, []);

  const getJobPosting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/job-postings/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const createJobPosting = useCallback(async (jobPostingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/hr/job-postings', jobPostingData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateJobPosting = useCallback(async (id, jobPostingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/job-postings/${id}`, jobPostingData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteJobPosting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/hr/job-postings/${id}`);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const closeJobPosting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/hr/job-postings/${id}/close`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error closing job posting');
      setLoading(false);
      throw err;
    }
  }, []);

  const analyzeJobRequirements = useCallback(async (description) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/hr/job-postings/analyze-requirements', { description });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing job requirements');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getJobPostings,
    getActiveJobPostings,
    getJobPosting,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    closeJobPosting,
    analyzeJobRequirements,
  };
};
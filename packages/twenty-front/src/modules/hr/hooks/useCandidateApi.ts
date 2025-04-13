import axios from 'axios';
import { useCallback, useState } from 'react';

// Custom hook for interacting with Candidate API
export const useCandidateApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/hr/candidates');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching candidates');
      setLoading(false);
      throw err;
    }
  }, []);

  const getCandidate = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/candidates/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching candidate');
      setLoading(false);
      throw err;
    }
  }, []);

  const createCandidate = useCallback(async (candidateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/hr/candidates', candidateData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating candidate');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateCandidate = useCallback(async (id, candidateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/candidates/${id}`, candidateData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating candidate');
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteCandidate = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/hr/candidates/${id}`);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting candidate');
      setLoading(false);
      throw err;
    }
  }, []);

  const analyzeResume = useCallback(async (resumeFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const response = await axios.post('/api/hr/candidates/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing resume');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getCandidates,
    getCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    analyzeResume,
  };
};
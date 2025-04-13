import axios from 'axios';
import { useCallback, useState } from 'react';

// Custom hook for interacting with Interview API
export const useInterviewApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/hr/interviews');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching interviews');
      setLoading(false);
      throw err;
    }
  }, []);

  const getInterview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/interviews/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching interview');
      setLoading(false);
      throw err;
    }
  }, []);

  const getInterviewsByApplication = useCallback(async (applicationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hr/interviews/application/${applicationId}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching interviews by application');
      setLoading(false);
      throw err;
    }
  }, []);

  const scheduleInterview = useCallback(async (interviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/hr/interviews', interviewData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error scheduling interview');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateInterview = useCallback(async (id, interviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/interviews/${id}`, interviewData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating interview');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateInterviewStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/hr/interviews/${id}/status`, { status });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating interview status');
      setLoading(false);
      throw err;
    }
  }, []);

  const evaluateResponses = useCallback(async (id, responses) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/hr/interviews/${id}/evaluate`, { responses });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error evaluating interview responses');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getInterviews,
    getInterview,
    getInterviewsByApplication,
    scheduleInterview,
    updateInterview,
    updateInterviewStatus,
    evaluateResponses,
  };
};
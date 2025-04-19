import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

interface CandidatePersonMapping {
  candidateId: string;
  personId: string;
}

interface CandidateData {
  id: string;
  resumeData?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    jobTitle?: string;
    linkedin?: string;
  };
  skills?: string[];
  experienceYears?: number;
}

// Custom hook for converting Candidates to CRM Persons
export const useCandidateToPerson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert a candidate to a person in the CRM
  const convertCandidateToPerson = useCallback(async (candidateId: string) => {
    setLoading(true);
    setError(null);
    try {
      // First get the candidate details
      const candidateResponse = await axios.get<CandidateData>(`/api/hr/candidates/${candidateId}`);
      const candidate = candidateResponse.data;

      // Prepare the person data from the candidate
      const personData = {
        // Extract name from resumeData or use placeholder
        name: {
          firstName: candidate.resumeData?.firstName || candidate.resumeData?.name?.split(' ')[0] || 'Unknown',
          lastName: candidate.resumeData?.lastName || 
                   (candidate.resumeData?.name && candidate.resumeData?.name.split(' ').length > 1 ? 
                    candidate.resumeData?.name.split(' ').slice(1).join(' ') : 
                    'Unknown')
        },
        emails: {
          primaryEmail: candidate.resumeData?.email || null,
          secondaryEmails: [],
        },
        jobTitle: candidate.resumeData?.jobTitle || null,
        linkedinLink: candidate.resumeData?.linkedin ? {
          primaryLink: { url: candidate.resumeData.linkedin, label: 'LinkedIn' },
          secondaryLinks: []
        } : null,
        // Map any other relevant fields
        // Store reference to original candidate ID in a custom field
        candidateId: candidate.id,
        // Add candidate skills as a note or in a custom field if available
        skills: candidate.skills?.join(', ') || '',
        experienceYears: candidate.experienceYears || 0,
      };

      // Create the person in CRM
      const response = await axios.post('/api/crm/people', personData);
      
      // Record the relationship between the candidate and the person
      await axios.post('/api/hr/candidate-person-mappings', {
        candidateId: candidate.id,
        personId: response.data.id
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || 'Error converting candidate to person'
        : 'Error converting candidate to person';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  // Check if a candidate is already linked to a person in CRM
  const isCandidateLinkedToPerson = useCallback(async (candidateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CandidatePersonMapping | null>(`/api/hr/candidate-person-mappings/${candidateId}`);
      setLoading(false);
      return !!response.data; // Return true if mapping exists
    } catch (err) {
      setLoading(false);
      // If 404, it means no mapping exists
      if (err instanceof AxiosError && err.response?.status === 404) {
        return false;
      }
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || 'Error checking candidate-person relationship'
        : 'Error checking candidate-person relationship';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Get all candidates linked to CRM persons
  const getLinkedCandidateIds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CandidatePersonMapping[]>('/api/hr/candidate-person-mappings');
      setLoading(false);
      
      // Return the mapping as an object for easy lookup
      const mappings: Record<string, string> = {};
      response.data.forEach((mapping: CandidatePersonMapping) => {
        mappings[mapping.candidateId] = mapping.personId;
      });
      
      return mappings;
    } catch (err) {
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || 'Error getting candidate-person mappings'
        : 'Error getting candidate-person mappings';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    convertCandidateToPerson,
    isCandidateLinkedToPerson,
    getLinkedCandidateIds,
    loading,
    error
  };
}; 
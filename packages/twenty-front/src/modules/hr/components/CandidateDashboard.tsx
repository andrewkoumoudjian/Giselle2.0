import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Flex,
    Heading,
    IconArrowRight,
    IconPlus,
    IconUserCircle,
    Table,
    Tabs,
    Tag,
    Text
} from 'twenty-ui';

import { useApplicationApi } from '../hooks/useApplicationApi';
import { useCandidateApi } from '../hooks/useCandidateApi';
import { useCandidateToPerson } from '../hooks/useCandidateToPerson';
import { useJobPostingApi } from '../hooks/useJobPostingApi';

export const CandidateDashboard = () => {
  const { getJobPostings, loading: jobsLoading } = useJobPostingApi();
  const { getCandidates, loading: candidatesLoading } = useCandidateApi();
  const { getApplications, loading: applicationsLoading } = useApplicationApi();
  const { convertCandidateToPerson, loading: conversionLoading } = useCandidateToPerson();

  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeView, setActiveView] = useState('candidates');
  const [crmLinkedCandidates, setCrmLinkedCandidates] = useState({});

  // Fetch jobs, candidates and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesData, applicationsData] = await Promise.all([
          getCandidates(),
          getApplications()
        ]);

        setCandidates(candidatesData);
        setApplications(applicationsData);
        
        // Check which candidates are already linked to CRM persons
        const linkedStatus = {};
        candidatesData.forEach(candidate => {
          // For now we'll just simulate this with a random boolean
          // In a real implementation, we would check against the Person entity
          linkedStatus[candidate.id] = Math.random() > 0.7;
        });
        
        setCrmLinkedCandidates(linkedStatus);
        
        // Set matched candidates initially to be all candidates
        setMatchedCandidates(candidatesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle converting a candidate to a CRM person
  const handleConvertToPerson = async (candidateId) => {
    try {
      await convertCandidateToPerson(candidateId);
      
      // Update the linked status
      setCrmLinkedCandidates(prev => ({
        ...prev,
        [candidateId]: true
      }));
    } catch (error) {
      console.error('Error converting candidate to person:', error);
    }
  };

  return (
    <Flex direction="column" gap="xl">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={1}>Candidate Dashboard</Heading>
        <Button 
          variant="primary" 
          icon={<IconPlus />}
        >
          Add New Candidate
        </Button>
      </Flex>
      
      <Tabs
        tabs={[
          { label: 'All Candidates', value: 'candidates' },
          { label: 'Applications', value: 'applications' }
        ]}
        activeTab={activeView}
        onTabChange={setActiveView}
      />
      
      {activeView === 'candidates' ? (
        <Card>
          <Flex direction="column" padding="l" gap="l">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>Candidates</Heading>
              {candidates.length > 0 && (
                <Text>{candidates.length} candidates</Text>
              )}
            </Flex>
            
            {candidatesLoading ? (
              <Text>Loading candidates...</Text>
            ) : candidates.length === 0 ? (
              <Text>No candidates found.</Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Candidate</Table.HeaderCell>
                    <Table.HeaderCell>Skills</Table.HeaderCell>
                    <Table.HeaderCell>Experience</Table.HeaderCell>
                    <Table.HeaderCell>Applications</Table.HeaderCell>
                    <Table.HeaderCell>CRM Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {candidates.map(candidate => {
                    const candidateApplications = applications.filter(
                      app => app.candidateId === candidate.id
                    );
                    
                    return (
                      <Table.Row key={candidate.id}>
                        <Table.Cell>
                          <Flex alignItems="center" gap="s">
                            <IconUserCircle size={24} />
                            <Text>{candidate.resumeData?.name || 'Unknown'}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="xs" wrap="wrap">
                            {candidate.skills?.slice(0, 3).map(skill => (
                              <Tag key={skill} color="blue">{skill}</Tag>
                            ))}
                            {candidate.skills?.length > 3 && (
                              <Text variant="caption">+{candidate.skills.length - 3} more</Text>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          {candidate.experienceYears} years
                        </Table.Cell>
                        <Table.Cell>
                          {candidateApplications.length > 0 ? (
                            <Tag color="green">{candidateApplications.length} applications</Tag>
                          ) : (
                            <Text color="gray">No applications</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {crmLinkedCandidates[candidate.id] ? (
                            <Tag color="green">In CRM</Tag>
                          ) : (
                            <Tag color="gray">Not in CRM</Tag>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="s">
                            <Button 
                              variant="secondary"
                              size="small"
                              icon={<IconArrowRight />}
                              iconPosition="right"
                            >
                              View Profile
                            </Button>
                            {!crmLinkedCandidates[candidate.id] && (
                              <Button 
                                variant="secondary"
                                size="small"
                                onClick={() => handleConvertToPerson(candidate.id)}
                                disabled={conversionLoading}
                              >
                                Add to CRM
                              </Button>
                            )}
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}
          </Flex>
        </Card>
      ) : (
        <Card>
          <Flex direction="column" padding="l" gap="l">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>Applications</Heading>
              {applications.length > 0 && (
                <Text>{applications.length} applications</Text>
              )}
            </Flex>
            
            {applicationsLoading ? (
              <Text>Loading applications...</Text>
            ) : applications.length === 0 ? (
              <Text>No applications found.</Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Candidate</Table.HeaderCell>
                    <Table.HeaderCell>Job Posting</Table.HeaderCell>
                    <Table.HeaderCell>Applied Date</Table.HeaderCell>
                    <Table.HeaderCell>Match Score</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {applications.map(application => {
                    const candidate = candidates.find(c => c.id === application.candidateId);
                    
                    return (
                      <Table.Row key={application.id}>
                        <Table.Cell>
                          <Flex alignItems="center" gap="s">
                            <IconUserCircle size={24} />
                            <Text>{candidate?.resumeData?.name || 'Unknown'}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          {application.jobPosting?.title || 'Unknown Job'}
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(application.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          <Tag 
                            color={
                              application.matchScore >= 80 ? 'green' : 
                              application.matchScore >= 60 ? 'yellow' : 'red'
                            }
                          >
                            {application.matchScore}%
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          <Tag 
                            color={
                              application.status === 'accepted' ? 'green' :
                              application.status === 'rejected' ? 'red' :
                              application.status === 'interviewing' ? 'blue' : 'gray'
                            }
                          >
                            {application.status}
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          <Button 
                            variant="secondary"
                            size="small"
                            icon={<IconArrowRight />}
                            iconPosition="right"
                          >
                            View Application
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}
          </Flex>
        </Card>
      )}
    </Flex>
  );
}; 
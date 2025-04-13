import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Flex,
    Heading,
    IconArrowRight,
    Select,
    Table,
    Tabs,
    Tag,
    Text
} from 'twenty-ui';

import { useApplicationApi } from '../hooks/useApplicationApi';
import { useCandidateApi } from '../hooks/useCandidateApi';
import { useJobPostingApi } from '../hooks/useJobPostingApi';

export const CandidateMatchingDashboard = () => {
  const { getJobPostings, loading: jobsLoading } = useJobPostingApi();
  const { getCandidates, loading: candidatesLoading } = useCandidateApi();
  const { getApplications, getMatchScore, loading: applicationsLoading } = useApplicationApi();

  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeView, setActiveView] = useState('matches');

  // Fetch jobs, candidates and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, candidatesData, applicationsData] = await Promise.all([
          getJobPostings(),
          getCandidates(),
          getApplications()
        ]);

        setJobPostings(jobsData);
        setCandidates(candidatesData);
        setApplications(applicationsData);

        // Set the first job as selected by default if available
        if (jobsData.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Get match scores when selected job changes
  useEffect(() => {
    const getMatches = async () => {
      if (!selectedJobId || candidates.length === 0) return;

      setLoadingMatches(true);
      try {
        // For each candidate, calculate match score with the selected job
        const matchPromises = candidates.map(async (candidate) => {
          // Check if an application already exists
          const existingApplication = applications.find(
            app => app.candidateId === candidate.id && app.jobPostingId === selectedJobId
          );

          let matchScore;
          if (existingApplication) {
            matchScore = existingApplication.matchScore;
          } else {
            // Calculate new match score
            const { score } = await getMatchScore(candidate.id, selectedJobId);
            matchScore = score;
          }

          return {
            ...candidate,
            matchScore,
            applicationStatus: existingApplication?.status || null
          };
        });

        const candidatesWithScores = await Promise.all(matchPromises);
        
        // Sort by match score descending
        const sortedCandidates = candidatesWithScores.sort((a, b) => b.matchScore - a.matchScore);
        setMatchedCandidates(sortedCandidates);
      } catch (error) {
        console.error('Error getting match scores:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    getMatches();
  }, [selectedJobId, candidates, applications]);

  // Format skill match to show matched skills
  const formatSkillMatch = (candidateSkills, jobSkills) => {
    if (!candidateSkills || !jobSkills) return { count: 0, total: 0, matchedSkills: [] };

    const matchedSkills = candidateSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
    );
    
    return {
      count: matchedSkills.length,
      total: jobSkills.length,
      matchedSkills
    };
  };

  // Get selected job details
  const selectedJob = jobPostings.find(job => job.id === selectedJobId);

  // Get current applications for the selected job
  const jobApplications = applications.filter(app => app.jobPostingId === selectedJobId);

  return (
    <Flex direction="column" gap="xl">
      <Heading level={1}>Candidate Matching</Heading>
      
      <Flex direction="column" gap="m">
        <Text variant="label">Select Job Posting</Text>
        <Select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          options={jobPostings.map(job => ({ label: job.title, value: job.id }))}
          placeholder="Select a job posting"
          disabled={jobPostings.length === 0 || jobsLoading}
        />
      </Flex>
      
      {selectedJob && (
        <Card>
          <Flex direction="column" padding="l" gap="m">
            <Heading level={3}>{selectedJob.title}</Heading>
            <Flex gap="s" wrap="wrap">
              <Tag color={selectedJob.status === 'active' ? 'green' : 'red'}>
                {selectedJob.status}
              </Tag>
              {selectedJob.requiredSkills?.map(skill => (
                <Tag key={skill} color="blue">{skill}</Tag>
              ))}
            </Flex>
            <Text>{selectedJob.description?.substring(0, 200)}...</Text>
          </Flex>
        </Card>
      )}
      
      <Tabs
        tabs={[
          { label: 'Candidate Matches', value: 'matches' },
          { label: 'Applications', value: 'applications' }
        ]}
        activeTab={activeView}
        onTabChange={setActiveView}
      />
      
      {activeView === 'matches' ? (
        <Card>
          <Flex direction="column" padding="l" gap="l">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>Matching Candidates</Heading>
              {matchedCandidates.length > 0 && (
                <Text>{matchedCandidates.length} candidates found</Text>
              )}
            </Flex>
            
            {loadingMatches ? (
              <Text>Calculating matches...</Text>
            ) : matchedCandidates.length === 0 ? (
              <Text>No matching candidates found.</Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Candidate</Table.HeaderCell>
                    <Table.HeaderCell>Match Score</Table.HeaderCell>
                    <Table.HeaderCell>Skills</Table.HeaderCell>
                    <Table.HeaderCell>Experience</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {matchedCandidates.map(candidate => {
                    const { count, total, matchedSkills } = formatSkillMatch(
                      candidate.skills, 
                      selectedJob.requiredSkills
                    );
                    
                    // Determine match quality based on score
                    const matchQuality = 
                      candidate.matchScore >= 80 ? 'high' :
                      candidate.matchScore >= 60 ? 'medium' : 'low';
                    
                    return (
                      <Table.Row key={candidate.id}>
                        <Table.Cell>
                          {candidate.resumeData?.name || 'Unknown'}
                        </Table.Cell>
                        <Table.Cell>
                          <Tag 
                            color={
                              matchQuality === 'high' ? 'green' : 
                              matchQuality === 'medium' ? 'yellow' : 'red'
                            }
                          >
                            {candidate.matchScore}%
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex direction="column" gap="xs">
                            <Text>{count}/{total} skills match</Text>
                            <Flex gap="xs" wrap="wrap">
                              {matchedSkills.slice(0, 3).map(skill => (
                                <Tag key={skill} color="blue" size="small">{skill}</Tag>
                              ))}
                              {matchedSkills.length > 3 && (
                                <Text variant="caption">+{matchedSkills.length - 3} more</Text>
                              )}
                            </Flex>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>{candidate.experienceYears} years</Table.Cell>
                        <Table.Cell>
                          {candidate.applicationStatus ? (
                            <Tag 
                              color={
                                candidate.applicationStatus === 'accepted' ? 'green' :
                                candidate.applicationStatus === 'rejected' ? 'red' :
                                candidate.applicationStatus === 'interviewing' ? 'blue' : 'gray'
                              }
                            >
                              {candidate.applicationStatus}
                            </Tag>
                          ) : (
                            <Text color="gray">No application</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Button 
                            variant="secondary"
                            size="small"
                            icon={<IconArrowRight />}
                            iconPosition="right"
                          >
                            View Profile
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
      ) : (
        <Card>
          <Flex direction="column" padding="l" gap="l">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>Applications</Heading>
              {jobApplications.length > 0 && (
                <Text>{jobApplications.length} applications received</Text>
              )}
            </Flex>
            
            {applicationsLoading ? (
              <Text>Loading applications...</Text>
            ) : jobApplications.length === 0 ? (
              <Text>No applications received for this job posting.</Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Candidate</Table.HeaderCell>
                    <Table.HeaderCell>Applied Date</Table.HeaderCell>
                    <Table.HeaderCell>Match Score</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Interview</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {jobApplications.map(application => {
                    const candidate = candidates.find(c => c.id === application.candidateId);
                    
                    return (
                      <Table.Row key={application.id}>
                        <Table.Cell>
                          {candidate?.resumeData?.name || 'Unknown'}
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
                          {application.status === 'interviewing' ? (
                            <Button 
                              variant="secondary"
                              size="small"
                            >
                              Schedule Interview
                            </Button>
                          ) : (
                            <Text color="gray">
                              {application.status === 'pending' ? 'Not yet' : 
                               application.status === 'rejected' ? 'Rejected' : 
                               application.status === 'accepted' ? 'Completed' : 'N/A'}
                            </Text>
                          )}
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
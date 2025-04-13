import { useEffect, useState } from 'react';

import { Button, Card, Flex, Grid, Heading, Text } from 'twenty-ui';

import { useApplicationApi } from '../hooks/useApplicationApi';
import { useCandidateApi } from '../hooks/useCandidateApi';
import { useJobPostingApi } from '../hooks/useJobPostingApi';

export const HrDashboard = () => {
  const { getJobPostings, loading: jobsLoading } = useJobPostingApi();
  const { getCandidates, loading: candidatesLoading } = useCandidateApi();
  const { getApplications, loading: applicationsLoading } = useApplicationApi();

  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, candidatesData, applicationsData] = await Promise.all([
          getJobPostings(),
          getCandidates(),
          getApplications(),
        ]);

        setJobPostings(jobsData);
        setCandidates(candidatesData);
        setApplications(applicationsData);

        // Calculate dashboard stats
        setStats({
          activeJobs: jobsData.filter(job => job.status === 'active').length,
          totalCandidates: candidatesData.length,
          pendingApplications: applicationsData.filter(app => app.status === 'pending').length,
          interviewsScheduled: applicationsData.filter(app => app.status === 'interviewing').length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [getJobPostings, getCandidates, getApplications]);

  const isLoading = jobsLoading || candidatesLoading || applicationsLoading;

  return (
    <Flex direction="column" gap="xl">
      <Heading level={1}>HR Dashboard</Heading>

      {isLoading ? (
        <Text>Loading dashboard data...</Text>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid numCols={4} gap="m">
            <Card>
              <Flex direction="column" padding="m">
                <Text variant="caption">Active Job Postings</Text>
                <Heading level={2}>{stats.activeJobs}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" padding="m">
                <Text variant="caption">Total Candidates</Text>
                <Heading level={2}>{stats.totalCandidates}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" padding="m">
                <Text variant="caption">Pending Applications</Text>
                <Heading level={2}>{stats.pendingApplications}</Heading>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" padding="m">
                <Text variant="caption">Interviews Scheduled</Text>
                <Heading level={2}>{stats.interviewsScheduled}</Heading>
              </Flex>
            </Card>
          </Grid>

          {/* Recent Job Postings */}
          <Card>
            <Flex direction="column" padding="m" gap="m">
              <Flex alignItems="center" justifyContent="space-between">
                <Heading level={3}>Recent Job Postings</Heading>
                <Button>Create New Job</Button>
              </Flex>
              
              {jobPostings.length === 0 ? (
                <Text>No job postings available</Text>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Skills</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostings.slice(0, 5).map(job => (
                      <tr key={job.id}>
                        <td style={{ padding: '8px' }}>{job.title}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: job.status === 'active' ? '#e6f7ed' : '#f8e6e6',
                            color: job.status === 'active' ? '#1e7d45' : '#d73a3a'
                          }}>
                            {job.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>{job.requiredSkills?.slice(0, 3).join(', ')}</td>
                        <td style={{ padding: '8px' }}>
                          {applications.filter(app => app.jobPostingId === job.id).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Flex>
          </Card>

          {/* Recent Candidates */}
          <Card>
            <Flex direction="column" padding="m" gap="m">
              <Flex alignItems="center" justifyContent="space-between">
                <Heading level={3}>Recent Candidates</Heading>
                <Button>View All</Button>
              </Flex>
              
              {candidates.length === 0 ? (
                <Text>No candidates available</Text>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Candidate</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Skills</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Experience</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 5).map(candidate => (
                      <tr key={candidate.id}>
                        <td style={{ padding: '8px' }}>
                          {candidate.resumeData?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {candidate.skills?.slice(0, 3).join(', ')}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {candidate.experienceYears} years
                        </td>
                        <td style={{ padding: '8px' }}>
                          <Button variant="secondary" size="small">View Profile</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Flex>
          </Card>
        </>
      )}
    </Flex>
  );
};
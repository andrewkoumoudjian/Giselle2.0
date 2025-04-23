import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure
} from 'twenty-ui';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from 'twenty-ui/layout';
/* Removed import of Section to avoid duplicate identifier errors */
// import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout/section/components/Section';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  resume_url: string;
}

interface Application {
  id: string;
  candidate: Candidate;
  job: {
    id: string;
    title: string;
  };
  status: string;
  ai_score: number;
  ai_analysis: any;
  created_at: string;
}

const HRDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [blindScreening, setBlindScreening] = useState(false);

  // State for candidate comparison modal and selection
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedForComparison((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId],
    );
  };

  const closeComparisonModal = () => {
    setShowComparisonModal(false);
    setSelectedForComparison([]);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setIsLoading(false);
  };

  const analyzeResume = async (applicationId: string) => {
    try {
      await axios.post(`/api/applications/${applicationId}/analyze`, { blindScreening });
      await fetchApplications();
    } catch (error) {
      console.error('Error analyzing resume:', error);
    }
  };

  const openDetails = (app: Application) => {
    setSelectedApp(app);
    onOpen();
  };

  return (
    <Flex p={5} flexDirection="column" gap={6}>
      <Heading size="lg" mb={4}>
        HR Dashboard
      </Heading>

      <Button colorScheme="blue" onClick={fetchApplications} mb={4} alignSelf="flex-start">
        Refresh Applications
      </Button>

      {isLoading ? (
        <Progress isIndeterminate />
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={4}>
          {applications.map((app) => (
            <Card key={app.id} rounded fullWidth>
              <CardHeader>
                {blindScreening ? (
                  <Text>
                    Candidate #{app.id.slice(0, 6)} (Blind)
                  </Text>
                ) : (
                  <>
                    {app.candidate.first_name} {app.candidate.last_name} - {app.job.title}
                  </>
                )}
              </CardHeader>
              <CardContent>
                <Box mb={2}>
                  <Badge
                    colorScheme={
                      app.status === 'shortlisted'
                        ? 'green'
                        : app.status === 'rejected'
                          ? 'red'
                          : app.status === 'new'
                            ? 'blue'
                            : 'gray'
                    }
                  >
                    {app.status}
                  </Badge>
                </Box>
                <Box mb={2}>
                  AI Score:{' '}
                  {app.ai_score ? (
                    <Badge
                      colorScheme={
                        app.ai_score > 80
                          ? 'green'
                          : app.ai_score > 60
                            ? 'yellow'
                            : 'red'
                      }
                    >
                      {app.ai_score}%
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray">Not analyzed</Badge>
                  )}
                </Box>
                <Box mb={2}>Applied: {new Date(app.created_at).toLocaleDateString()}</Box>
              </CardContent>
              <CardFooter>
                <Button size="sm" mr={2} onClick={() => openDetails(app)}>
                  Details
                </Button>
                {!app.ai_score && (
                  <Button size="sm" colorScheme="teal" onClick={() => analyzeResume(app.id)}>
                    Analyze
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </Box>
      )}

      {selectedApp && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {blindScreening ? (
                <Text>
                  Candidate #{selectedApp.id.slice(0, 6)} (Blind)
                </Text>
              ) : (
                <>
                  {selectedApp.candidate.first_name}{' '}
                  {selectedApp.candidate.last_name}
                </>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs>
                <TabList>
                  <Tab>Summary</Tab>
                  <Tab>Skills Analysis</Tab>
                  <Tab>Job Match</Tab>
                  <Tab>Interview Scheduling</Tab>
                  <Tab>Feedback</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Flex mb={4}>
                      <Stat>
                        <StatLabel>AI Match Score</StatLabel>
                        <StatNumber>
                          {selectedApp.ai_score || 'N/A'}%
                        </StatNumber>
                        <StatHelpText>
                          Applied for {selectedApp.job.title}
                        </StatHelpText>
                      </Stat>
                    </Flex>
                    {selectedApp.ai_analysis?.summary && (
                      <Box mt={4}>
                        <Heading size="sm" mb={2}>
                          Analysis Summary
                        </Heading>
                        <Text>{selectedApp.ai_analysis.summary}</Text>
                      </Box>
                    )}
                    <Box mt={4}>
                      <Heading size="sm" mb={2}>
                        Contact Info
                      </Heading>
                      <Text>Email: {selectedApp.candidate.email}</Text>
                      <Text mt={2}>
                        <a
                          href={selectedApp.candidate.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'blue', textDecoration: 'underline' }}
                        >
                          Download Resume
                        </a>
                      </Text>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    {selectedApp.ai_analysis?.skills ? (
                      <>
                        <Box mb={4}>
                          <Heading size="sm" mb={2}>
                            Technical Skills
                          </Heading>
                          <Flex wrap="wrap">
                            {selectedApp.ai_analysis.skills.technicalSkills.map(
                              (skill: string, i: number) => (
                                <Badge key={i} m={1} colorScheme="blue">
                                  {skill}
                                </Badge>
                              ),
                            )}
                          </Flex>
                        </Box>
                        <Box mb={4}>
                          <Heading size="sm" mb={2}>
                            Soft Skills
                          </Heading>
                          <Flex wrap="wrap">
                            {selectedApp.ai_analysis.skills.softSkills.map(
                              (skill: string, i: number) => (
                                <Badge key={i} m={1} colorScheme="purple">
                                  {skill}
                                </Badge>
                              ),
                            )}
                          </Flex>
                        </Box>
                      </>
                    ) : (
                      <Text>No skills analysis available</Text>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {selectedApp.ai_analysis?.matching ? (
                      <>
                        <Box mb={4}>
                          <Heading size="sm" mb={2}>
                            Key Matches
                          </Heading>
                          <Text>
                            {selectedApp.ai_analysis.matching.keyMatches.join(
                              ', ',
                            )}
                          </Text>
                        </Box>
                        <Box mb={4}>
                          <Heading size="sm" mb={2}>
                            Missing Qualifications
                          </Heading>
                          <Text>
                            {selectedApp.ai_analysis.matching.missingQualifications.join(
                              ', ',
                            )}
                          </Text>
                        </Box>
                        <Box mb={4}>
                          <Heading size="sm" mb={2}>
                            Additional Strengths
                          </Heading>
                          <Text>
                            {selectedApp.ai_analysis.matching.additionalStrengths.join(
                              ', ',
                            )}
                          </Text>
                        </Box>
                      </>
                    ) : (
                      <Text>No matching analysis available</Text>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {/* Interview Scheduling Form */}
                    <Box>
                      <Heading size="sm" mb={4}>Schedule Interview</Heading>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          // TODO: Implement interview scheduling handler
                          alert('Interview scheduled (mock)');
                        }}
                      >
                        <Box mb={3}>
                          <label htmlFor="interviewDate">Date:</label>
                          <input
                            type="date"
                            id="interviewDate"
                            name="interviewDate"
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                          />
                        </Box>
                        <Box mb={3}>
                          <label htmlFor="interviewTime">Time:</label>
                          <input
                            type="time"
                            id="interviewTime"
                            name="interviewTime"
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                          />
                        </Box>
                        <Box mb={3}>
                          <label htmlFor="interviewMode">Mode:</label>
                          <select
                            id="interviewMode"
                            name="interviewMode"
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                          >
                            <option value="in-person">In-person</option>
                            <option value="video">Video Call</option>
                            <option value="phone">Phone Call</option>
                          </select>
                        </Box>
                        <Button type="submit" colorScheme="blue">Schedule</Button>
                      </form>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    {/* Feedback Collection Form */}
                    <Box>
                      <Heading size="sm" mb={4}>Candidate Feedback</Heading>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          // TODO: Implement feedback submission handler
                          alert('Feedback submitted (mock)');
                        }}
                      >
                        <Box mb={3}>
                          <label htmlFor="feedbackText">Feedback:</label>
                          <textarea
                            id="feedbackText"
                            name="feedbackText"
                            rows={5}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                          />
                        </Box>
                        <Button type="submit" colorScheme="green">Submit Feedback</Button>
                      </form>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Flex>
  );
};

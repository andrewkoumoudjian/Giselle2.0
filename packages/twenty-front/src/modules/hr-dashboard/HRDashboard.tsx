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
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabase/config';

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

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('giselle.applications')
      .select(
        `id,
        status,
        ai_score,
        ai_analysis,
        created_at,
        candidate:candidate_id (id, first_name, last_name, email, resume_url),
        job:job_id (id, title)`,
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  const analyzeResume = async (applicationId: string) => {
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) throw new Error('Analysis failed');

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
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">HR Dashboard</Heading>
        <Button colorScheme="blue" onClick={fetchApplications}>
          Refresh
        </Button>
      </Flex>

      {isLoading ? (
        <Progress isIndeterminate />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Candidate</Th>
              <Th>Job</Th>
              <Th>Status</Th>
              <Th>AI Score</Th>
              <Th>Applied</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {applications.map((app) => (
              <Tr key={app.id}>
                <Td>
                  {app.candidate.first_name} {app.candidate.last_name}
                </Td>
                <Td>{app.job.title}</Td>
                <Td>
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
                </Td>
                <Td>
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
                </Td>
                <Td>{new Date(app.created_at).toLocaleDateString()}</Td>
                <Td>
                  <Button size="sm" mr={2} onClick={() => openDetails(app)}>
                    Details
                  </Button>
                  {!app.ai_score && (
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => analyzeResume(app.id)}
                    >
                      Analyze
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {selectedApp && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedApp.candidate.first_name}{' '}
              {selectedApp.candidate.last_name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs>
                <TabList>
                  <Tab>Summary</Tab>
                  <Tab>Skills Analysis</Tab>
                  <Tab>Job Match</Tab>
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
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default HRDashboard;

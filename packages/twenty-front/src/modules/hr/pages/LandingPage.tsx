import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Container,
    Flex,
    Heading,
    IconChevronRight,
    Input,
    Separator,
    Tabs,
    Text
} from 'twenty-ui';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    // Implement authentication logic here
    console.log('Login:', { email, password, userType: activeTab });
  };
  
  const handleGeneralApplication = () => {
    // Navigate to general application form
    console.log('Navigate to general application');
  };

  return (
    <Container>
      <Flex direction="column" alignItems="center" padding="xxl" gap="xl">
        <Box maxWidth="700px" width="100%">
          <Flex direction="column" alignItems="center" gap="l">
            <Heading level={1}>Giselle AI-Powered HR Platform</Heading>
            <Text align="center" color="gray">
              Streamline your recruitment process with AI-powered candidate matching, 
              automated resume screening, and unbiased interview assessment.
            </Text>
          </Flex>
        </Box>
        
        <Flex width="100%" maxWidth="1200px" gap="xl" wrap="wrap">
          {/* Left side - Login */}
          <Box flex={1} minWidth="300px">
            <Card>
              <Flex direction="column" padding="l" gap="l">
                <Heading level={3}>Log In</Heading>
                <Tabs
                  tabs={[
                    { label: 'Candidate', value: 'candidate' },
                    { label: 'HR Staff', value: 'hr' }
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                
                <Flex direction="column" gap="m">
                  <Flex direction="column" gap="xs">
                    <Text variant="label">Email</Text>
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Flex>
                  
                  <Flex direction="column" gap="xs">
                    <Text variant="label">Password</Text>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Flex>
                  
                  <Button 
                    onClick={handleLogin}
                    icon={<IconChevronRight />}
                    iconPosition="right"
                  >
                    Log In
                  </Button>
                  
                  {activeTab === 'candidate' && (
                    <Flex direction="column" gap="m" marginTop="m">
                      <Separator />
                      <Text align="center">Don't have an account?</Text>
                      <Button variant="secondary">Create Account</Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Box>
          
          {/* Right side - General Application or HR Dashboard Preview */}
          <Box flex={1} minWidth="300px">
            <Card>
              <Flex direction="column" padding="l" gap="l">
                {activeTab === 'candidate' ? (
                  <>
                    <Heading level={3}>General Application</Heading>
                    <Text>
                      Not applying for a specific position? Submit a general application 
                      to be considered for all suitable positions that match your skills and experience.
                    </Text>
                    <Button 
                      variant="primary" 
                      onClick={handleGeneralApplication}
                    >
                      Start General Application
                    </Button>
                  </>
                ) : (
                  <>
                    <Heading level={3}>HR Dashboard</Heading>
                    <Text>
                      The HR dashboard provides a comprehensive view of your recruitment pipeline.
                      Manage job postings, screen candidates, schedule interviews, and make data-driven hiring decisions.
                    </Text>
                    <img 
                      src="/hr-dashboard-preview.png" 
                      alt="HR Dashboard Preview" 
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </>
                )}
              </Flex>
            </Card>
          </Box>
        </Flex>
        
        {/* Features Section */}
        <Box maxWidth="1200px" width="100%" marginTop="xxl">
          <Flex direction="column" gap="xl">
            <Heading level={2} align="center">Powered by AI</Heading>
            
            <Flex gap="l" wrap="wrap">
              <Card flex={1} minWidth="250px">
                <Flex direction="column" padding="l" gap="m">
                  <Heading level={4}>Resume Analysis</Heading>
                  <Text>
                    Automatically extract skills, experience, and qualifications from resumes
                    to match candidates with suitable positions.
                  </Text>
                </Flex>
              </Card>
              
              <Card flex={1} minWidth="250px">
                <Flex direction="column" padding="l" gap="m">
                  <Heading level={4}>Skill Matching</Heading>
                  <Text>
                    Identify the best candidates for each position based on required skills
                    and experience with intelligent matching algorithms.
                  </Text>
                </Flex>
              </Card>
              
              <Card flex={1} minWidth="250px">
                <Flex direction="column" padding="l" gap="m">
                  <Heading level={4}>Interview Assessment</Heading>
                  <Text>
                    Conduct fair and unbiased interviews with AI-generated questions
                    and objective evaluation of responses.
                  </Text>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Heading, Text } from 'twenty-ui';

export const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      gap="xl"
      style={{ 
        minHeight: '100vh',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f5f8fa'
      }}
    >
      <Heading level={1}>Twenty HR Module</Heading>
      <Text>Simplify your recruiting process with integrated candidate management</Text>
      
      <Flex gap="l">
        <Button
          variant="primary"
          onClick={() => navigate('/hr/dashboard')}
        >
          View HR Dashboard
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/hr/candidate-dashboard')}
        >
          Go to Candidate Dashboard
        </Button>
      </Flex>
      
      <Flex 
        direction="column" 
        gap="l" 
        align="center"
        style={{ 
          maxWidth: '800px',
          marginTop: '30px'
        }}
      >
        <Heading level={3}>Features</Heading>
        <Flex gap="l" wrap="wrap" justify="center">
          <FeatureCard 
            title="Candidate Management" 
            description="Organize and track all your candidates in one place"
          />
          <FeatureCard 
            title="CRM Integration" 
            description="Seamlessly convert candidates to contacts in your CRM"
          />
          <FeatureCard 
            title="Resume Parsing" 
            description="AI-powered resume analysis and skill matching"
          />
          <FeatureCard 
            title="Application Tracking" 
            description="Track applications through your hiring pipeline"
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <Flex 
    direction="column" 
    gap="s"
    style={{ 
      width: '320px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}
  >
    <Heading level={4}>{title}</Heading>
    <Text>{description}</Text>
  </Flex>
);
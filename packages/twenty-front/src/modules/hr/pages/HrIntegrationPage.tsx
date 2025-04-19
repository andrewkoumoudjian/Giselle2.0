import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Flex,
    Heading,
    IconFileAnalytics
} from 'twenty-ui';

import { CandidateNavigationMenu } from '../components/CandidateNavigationMenu';

export const HrIntegrationPage = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Simulate loading state for HR module
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <Flex direction="column" align="center" justify="center" style={{ height: '100vh' }}>
        <IconFileAnalytics size={48} />
        <Heading level={3}>Loading HR module...</Heading>
      </Flex>
    );
  }

  return (
    <Flex>
      <Flex 
        direction="column" 
        style={{ 
          width: '220px', 
          borderRight: '1px solid #eaeaea',
          height: '100vh',
          padding: '16px'
        }}
      >
        <Heading level={4}>HR Module</Heading>
        <CandidateNavigationMenu />
      </Flex>
      <Flex 
        direction="column"
        style={{ 
          flex: 1,
          padding: '24px'
        }}
      >
        <Outlet />
      </Flex>
    </Flex>
  );
}; 
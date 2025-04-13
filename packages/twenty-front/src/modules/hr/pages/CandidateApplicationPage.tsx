import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MainLayout } from '@/ui/layout/main-layout/components/MainLayout';
import { PageTitle } from '@/ui/utilities/page/page-title/components/PageTitle';
import { CandidateApplicationForm } from '../components/CandidateApplicationForm';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

export const CandidateApplicationPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title when component mounts
    document.title = 'Candidate Application | Twenty';
  }, []);

  return (
    <MainLayout>
      <StyledContainer>
        <StyledHeaderContainer>
          <PageTitle title="Candidate Application" />
          <StyledDescription>
            Please fill out the form below to submit your application. All fields marked with * are required.
          </StyledDescription>
        </StyledHeaderContainer>
        <CandidateApplicationForm />
      </StyledContainer>
    </MainLayout>
  );
};
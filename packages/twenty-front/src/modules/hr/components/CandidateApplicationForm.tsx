import { gql, useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPlus, IconUpload } from 'twenty-ui/display';
import { Button, TextArea, TextInput } from 'twenty-ui/input';

// Container for the entire application form
const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(8)};
`;

// Section containers
const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

// Form fields container
const StyledFieldsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Container for file uploads
const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// Drop zone styling
const StyledDropZone = styled.div<{ isDragActive?: boolean; hasFile?: boolean }>`
  border: 2px dashed ${({ theme, isDragActive, hasFile }) => 
    isDragActive 
      ? theme.color.blue 
      : hasFile 
        ? theme.color.green
        : theme.border.color.medium
  };
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: ${({ theme, isDragActive, hasFile }) => 
    isDragActive 
      ? theme.background.tertiary
      : hasFile
        ? theme.background.quaternary
        : theme.background.secondary
  };
`;

// File info display
const StyledFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledFileName = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledFileSize = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSubmitButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

// Hidden file input
const StyledFileInput = styled.input`
  display: none;
`;

// GraphQL mutation for submitting an application
const SUBMIT_APPLICATION = gql`
  mutation SubmitApplication(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phone: String
    $linkedinUrl: String
    $coverNote: String
    $resumeFileId: String!
    $coverLetterFileId: String
  ) {
    submitApplication(
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      linkedinUrl: $linkedinUrl
      coverNote: $coverNote
      resumeFileId: $resumeFileId
      coverLetterFileId: $coverLetterFileId
    ) {
      id
      createdAt
    }
  }
`;

// GraphQL mutation for file upload
const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $fileFolder: FileFolder) {
    uploadFile(file: $file, fileFolder: $fileFolder)
  }
`;

// Convert bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const CandidateApplicationForm = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  
  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  
  // File states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File input refs
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  // GraphQL mutations
  const [uploadFile] = useMutation(UPLOAD_FILE);
  const [submitApplication] = useMutation(SUBMIT_APPLICATION);

  // Resume dropzone setup
  const { 
    getRootProps: getResumeRootProps, 
    getInputProps: getResumeInputProps, 
    isDragActive: isResumeDragActive,
    open: openResumeDialog
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setResumeFile(acceptedFiles[0]);
      }
    },
    noClick: true,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  // Cover letter dropzone setup
  const { 
    getRootProps: getCoverLetterRootProps, 
    getInputProps: getCoverLetterInputProps, 
    isDragActive: isCoverLetterDragActive,
    open: openCoverLetterDialog
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setCoverLetterFile(acceptedFiles[0]);
      }
    },
    noClick: true,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  // Handler for clicking on resume upload area
  const handleResumeUploadClick = () => {
    openResumeDialog();
  };

  // Handler for clicking on cover letter upload area
  const handleCoverLetterUploadClick = () => {
    openCoverLetterDialog();
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      enqueueSnackBar('Resume is required', { variant: SnackBarVariant.Error });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload resume file
      const resumeUploadResult = await uploadFile({
        variables: {
          file: resumeFile,
          fileFolder: 'CANDIDATE_RESUME'
        }
      });
      
      const resumeFileId = resumeUploadResult.data.uploadFile;
      
      // Upload cover letter if provided
      let coverLetterFileId = null;
      if (coverLetterFile) {
        const coverLetterUploadResult = await uploadFile({
          variables: {
            file: coverLetterFile,
            fileFolder: 'CANDIDATE_COVER_LETTER'
          }
        });
        
        coverLetterFileId = coverLetterUploadResult.data.uploadFile;
      }
      
      // Submit application with file IDs
      const result = await submitApplication({
        variables: {
          firstName,
          lastName,
          email,
          phone,
          linkedinUrl,
          coverNote,
          resumeFileId,
          coverLetterFileId
        }
      });
      
      // Show success message
      enqueueSnackBar('Application submitted successfully!', { variant: SnackBarVariant.Success });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setLinkedinUrl('');
      setCoverNote('');
      setResumeFile(null);
      setCoverLetterFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      enqueueSnackBar('Failed to submit application. Please try again.', { variant: SnackBarVariant.Error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledFormContainer>
      <StyledSection>
        <StyledSectionTitle>Candidate Application</StyledSectionTitle>
      </StyledSection>

      <form onSubmit={handleSubmit}>
        <StyledSection>
          <StyledSectionTitle>Personal Information</StyledSectionTitle>
          <StyledFieldsContainer>
            <TextInput
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              fullWidth
              required
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              fullWidth
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              fullWidth
              required
            />
            <TextInput
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              fullWidth
            />
            <TextInput
              label="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="Enter your LinkedIn profile URL"
              fullWidth
            />
          </StyledFieldsContainer>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Resume</StyledSectionTitle>
          <StyledFileUploadContainer>
            <StyledDropZone 
              {...getResumeRootProps()} 
              isDragActive={isResumeDragActive}
              hasFile={!!resumeFile}
              onClick={handleResumeUploadClick}
            >
              <StyledFileInput {...getResumeInputProps()} ref={resumeInputRef} />
              
              {resumeFile ? (
                <StyledFileInfo>
                  <IconUpload size={theme.icon.size.md} />
                  <div>
                    <StyledFileName>{resumeFile.name}</StyledFileName>
                    <StyledFileSize>{formatBytes(resumeFile.size)}</StyledFileSize>
                  </div>
                  <Button 
                    Icon={IconPlus} 
                    title="Change file" 
                    size="small"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openResumeDialog();
                    }}
                  />
                </StyledFileInfo>
              ) : (
                <>
                  <IconUpload size={theme.icon.size.lg} />
                  <div>
                    <div>Upload your resume (PDF, DOC, DOCX)</div>
                    <div>Drag and drop or click to browse</div>
                  </div>
                </>
              )}
            </StyledDropZone>
          </StyledFileUploadContainer>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Cover Letter (Optional)</StyledSectionTitle>
          <StyledFileUploadContainer>
            <StyledDropZone 
              {...getCoverLetterRootProps()} 
              isDragActive={isCoverLetterDragActive}
              hasFile={!!coverLetterFile}
              onClick={handleCoverLetterUploadClick}
            >
              <StyledFileInput {...getCoverLetterInputProps()} ref={coverLetterInputRef} />
              
              {coverLetterFile ? (
                <StyledFileInfo>
                  <IconUpload size={theme.icon.size.md} />
                  <div>
                    <StyledFileName>{coverLetterFile.name}</StyledFileName>
                    <StyledFileSize>{formatBytes(coverLetterFile.size)}</StyledFileSize>
                  </div>
                  <Button 
                    Icon={IconPlus} 
                    title="Change file" 
                    size="small"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCoverLetterDialog();
                    }}
                  />
                </StyledFileInfo>
              ) : (
                <>
                  <IconUpload size={theme.icon.size.lg} />
                  <div>
                    <div>Upload your cover letter (PDF, DOC, DOCX)</div>
                    <div>Drag and drop or click to browse</div>
                  </div>
                </>
              )}
            </StyledDropZone>
          </StyledFileUploadContainer>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Additional Information</StyledSectionTitle>
          <TextArea
            label="Cover Note"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Please provide any additional information you'd like us to know about your application"
            rows={4}
            fullWidth
          />
        </StyledSection>

        <StyledSubmitButtonContainer>
          <Button 
            title="Submit Application" 
            variant="primary" 
            type="submit"
            disabled={isSubmitting || !resumeFile}
            loading={isSubmitting}
          />
        </StyledSubmitButtonContainer>
      </form>
    </StyledFormContainer>
  );
};
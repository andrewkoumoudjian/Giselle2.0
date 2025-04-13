import { useState } from 'react';
import {
    Button,
    Card,
    Chip,
    Flex,
    Heading,
    IconCloudUpload,
    IconDocument,
    IconRefresh,
    IconTrash,
    List,
    ListItem,
    Text
} from 'twenty-ui';

import { useCandidateApi } from '../hooks/useCandidateApi';

export const ResumeUpload = ({ onAnalysisComplete }) => {
  const { analyzeResume, loading, error } = useCandidateApi();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setAnalysis(null); // Reset previous analysis when a new file is selected
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    setAnalysis(null);
  };
  
  const handleUploadClick = () => {
    document.getElementById('resume-upload-input').click();
  };
  
  const handleAnalyzeResume = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await analyzeResume(selectedFile);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
    }
  };
  
  return (
    <Card>
      <Flex direction="column" padding="l" gap="l">
        <Heading level={3}>Resume Upload & Analysis</Heading>
        
        {error && (
          <Text color="danger">Error: {error}</Text>
        )}
        
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          gap="m"
          padding="l"
          border="1px dashed #ccc"
          borderRadius="m"
          backgroundColor={dragActive ? 'backgroundLight' : 'transparent'}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleUploadClick}
        >
          <input
            id="resume-upload-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileChange(e.target.files[0])}
            style={{ display: 'none' }}
          />
          
          <IconCloudUpload size="xl" color="gray" />
          
          <Text align="center">
            Drag & drop your resume here or <strong>click to browse</strong>
          </Text>
          
          <Text variant="caption" color="gray" align="center">
            Supported formats: PDF, DOC, DOCX, TXT
          </Text>
        </Flex>
        
        {selectedFile && (
          <Flex direction="column" gap="m">
            <Flex gap="s" alignItems="center">
              <IconDocument size="m" />
              <Text>{fileName}</Text>
              <Button
                variant="tertiary"
                size="small"
                icon={<IconTrash />}
                onClick={handleRemoveFile}
              />
            </Flex>
            
            <Button
              variant="primary"
              onClick={handleAnalyzeResume}
              disabled={loading}
              icon={loading ? null : <IconRefresh />}
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </Flex>
        )}
        
        {analysis && (
          <Flex direction="column" gap="m">
            <Heading level={4}>Analysis Results</Heading>
            
            <Flex direction="column" gap="s">
              <Text variant="label">Detected Skills</Text>
              <Flex gap="xs" wrap="wrap">
                {analysis.skills.map((skill) => (
                  <Chip key={skill} label={skill} />
                ))}
                {analysis.skills.length === 0 && (
                  <Text color="gray">No skills detected</Text>
                )}
              </Flex>
            </Flex>
            
            <Flex direction="column" gap="s">
              <Text variant="label">Experience</Text>
              <Text>{analysis.experienceYears} years</Text>
            </Flex>
            
            <Flex direction="column" gap="s">
              <Text variant="label">Education</Text>
              <List>
                {analysis.resumeData.education?.map((edu, index) => (
                  <ListItem key={index}>
                    {edu.degree} in {edu.field}, {edu.institution} ({edu.year})
                  </ListItem>
                ))}
                {!analysis.resumeData.education?.length && (
                  <Text color="gray">No education details detected</Text>
                )}
              </List>
            </Flex>
            
            <Flex direction="column" gap="s">
              <Text variant="label">Work Experience</Text>
              <List>
                {analysis.resumeData.workExperience?.map((exp, index) => (
                  <ListItem key={index}>
                    <strong>{exp.title}</strong> at {exp.company} ({exp.startDate} - {exp.endDate || 'Present'})
                  </ListItem>
                ))}
                {!analysis.resumeData.workExperience?.length && (
                  <Text color="gray">No work experience detected</Text>
                )}
              </List>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
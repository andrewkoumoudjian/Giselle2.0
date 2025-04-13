import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Chip,
    Flex,
    Heading,
    IconCheck,
    IconPlus,
    Input,
    Select,
    Text,
    Textarea
} from 'twenty-ui';

import { useJobPostingApi } from '../hooks/useJobPostingApi';

export const JobPostingForm = ({ initialData, onSubmit, onCancel }) => {
  const { analyzeJobRequirements, loading, error } = useJobPostingApi();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    salaryRange: '',
    status: 'active',
    ...initialData,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Auto-extract skills when description is updated (with debounce)
  useEffect(() => {
    if (!formData.description || formData.description.length < 50) return;

    const timer = setTimeout(() => {
      handleExtractSkills();
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtractSkills = async () => {
    if (!formData.description || formData.description.length < 50) return;
    
    setIsAnalyzing(true);
    try {
      const skills = await analyzeJobRequirements(formData.description);
      setFormData((prev) => ({
        ...prev,
        requiredSkills: skills
      }));
    } catch (err) {
      console.error('Error analyzing job requirements:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" padding="l" gap="l">
          <Heading level={3}>{initialData ? 'Edit Job Posting' : 'Create Job Posting'}</Heading>
          
          {error && (
            <Text color="danger">Error: {error}</Text>
          )}
          
          <Flex direction="column" gap="m">
            {/* Job Title */}
            <Flex direction="column" gap="xs">
              <Text variant="label">Job Title*</Text>
              <Input
                name="title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Flex>
            
            {/* Job Description */}
            <Flex direction="column" gap="xs">
              <Text variant="label">Job Description*</Text>
              <Textarea
                name="description"
                placeholder="Enter detailed job description, responsibilities, and requirements..."
                value={formData.description}
                onChange={handleChange}
                minRows={6}
                required
              />
              <Text variant="caption" color="gray">
                The AI will automatically extract required skills from your description.
              </Text>
            </Flex>
            
            {/* Required Skills */}
            <Flex direction="column" gap="xs">
              <Text variant="label">Required Skills</Text>
              <Flex alignItems="center" gap="s">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button
                  variant="secondary"
                  icon={<IconPlus />}
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </Flex>
              
              <Flex gap="xs" wrap="wrap" marginTop="xs">
                {formData.requiredSkills.map((skill) => (
                  <Chip 
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                  />
                ))}
                
                {formData.requiredSkills.length === 0 && !isAnalyzing && (
                  <Text color="gray">No skills added yet.</Text>
                )}
                
                {isAnalyzing && (
                  <Text color="gray">Analyzing requirements...</Text>
                )}
              </Flex>
              
              <Button 
                variant="tertiary" 
                size="small" 
                onClick={handleExtractSkills}
                disabled={!formData.description || formData.description.length < 50 || isAnalyzing}
              >
                Extract Skills from Description
              </Button>
            </Flex>
            
            {/* Salary Range */}
            <Flex direction="column" gap="xs">
              <Text variant="label">Salary Range</Text>
              <Input
                name="salaryRange"
                placeholder="e.g. $100,000 - $130,000"
                value={formData.salaryRange}
                onChange={handleChange}
              />
            </Flex>
            
            {/* Status */}
            <Flex direction="column" gap="xs">
              <Text variant="label">Status</Text>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Draft', value: 'draft' },
                  { label: 'Closed', value: 'closed' }
                ]}
              />
            </Flex>
          </Flex>
          
          <Flex gap="m" justifyContent="flex-end">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              icon={<IconCheck />}
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};
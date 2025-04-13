import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Flex,
    Heading,
    IconSend,
    Progress,
    Tag,
    Text,
    Textarea
} from 'twenty-ui';

import { useInterviewApi } from '../hooks/useInterviewApi';

export const InterviewSession = ({ interviewId, applicationId, readOnly = false }) => {
  const { 
    getInterview, 
    evaluateResponses, 
    updateInterviewStatus,
    loading, 
    error 
  } = useInterviewApi();

  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        let interview;
        if (interviewId) {
          interview = await getInterview(interviewId);
        } else if (applicationId) {
          // Get the most recent interview for this application
          const interviews = await getInterviewsByApplication(applicationId);
          interview = interviews[0]; // Most recent should be first
        }

        if (interview) {
          setInterview(interview);
          
          // Initialize responses from existing data
          const responseMap = {};
          interview.questions.forEach(q => {
            if (q.response) {
              responseMap[q.id] = q.response;
            }
          });
          setResponses(responseMap);
          
          // Check if interview is already completed
          setIsCompleted(interview.status === 'completed');
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
      }
    };

    fetchInterview();
  }, [interviewId, applicationId]);

  // Move to next question
  const handleNextQuestion = () => {
    if (currentResponse.trim()) {
      // Save the current response
      setResponses(prev => ({
        ...prev,
        [interview.questions[currentQuestionIndex].id]: currentResponse
      }));
      setCurrentResponse('');
    }

    // Move to next question if not at the end
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Move to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit all responses for evaluation
  const handleSubmitInterview = async () => {
    // Save the current response if there is one
    if (currentResponse.trim()) {
      setResponses(prev => ({
        ...prev,
        [interview.questions[currentQuestionIndex].id]: currentResponse
      }));
    }

    // Prepare responses for submission
    const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
      questionId,
      response
    }));

    setIsSubmitting(true);
    try {
      const updatedInterview = await evaluateResponses(interview.id, responsesArray);
      setInterview(updatedInterview);
      setIsCompleted(true);
      await updateInterviewStatus(interview.id, 'completed');
    } catch (error) {
      console.error('Error submitting interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no interview data yet, show loading
  if (!interview) {
    return (
      <Card>
        <Flex direction="column" padding="l" gap="m" alignItems="center">
          <Heading level={3}>Interview Session</Heading>
          <Text>Loading interview questions...</Text>
        </Flex>
      </Card>
    );
  }

  // Get current question
  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <Card>
      <Flex direction="column" padding="l" gap="l">
        <Heading level={3}>
          {isCompleted ? 'Interview Results' : 'Interview Session'}
        </Heading>

        {error && (
          <Text color="danger">Error: {error}</Text>
        )}

        {/* Progress indicator */}
        {!isCompleted && (
          <Flex direction="column" gap="xs">
            <Flex justifyContent="space-between">
              <Text variant="caption">
                Question {currentQuestionIndex + 1} of {interview.questions.length}
              </Text>
              <Text variant="caption">{Math.round(progress)}% complete</Text>
            </Flex>
            <Progress value={progress} />
          </Flex>
        )}

        {isCompleted ? (
          // Interview results view
          <Flex direction="column" gap="l">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>Overall Score</Heading>
              <Tag
                color={interview.overallScore >= 75 ? 'green' : interview.overallScore >= 50 ? 'yellow' : 'red'}
              >
                {interview.overallScore}/100
              </Tag>
            </Flex>

            {interview.questions.map((question, index) => (
              <Flex key={question.id} direction="column" gap="m" padding="m" backgroundColor="backgroundLight" borderRadius="m">
                <Flex justifyContent="space-between" alignItems="center">
                  <Text variant="label">Question {index + 1}: {question.type === 'technical' ? `Technical (${question.skill})` : 'General'}</Text>
                  {question.score && (
                    <Tag
                      color={question.score >= 4 ? 'green' : question.score >= 3 ? 'yellow' : 'red'}
                    >
                      {question.score}/5
                    </Tag>
                  )}
                </Flex>
                
                <Text fontWeight="semiBold">{question.question}</Text>
                
                {question.response ? (
                  <Flex direction="column" gap="xs">
                    <Text variant="caption">Response:</Text>
                    <Text>{question.response}</Text>
                  </Flex>
                ) : (
                  <Text color="gray">No response provided</Text>
                )}
                
                {question.feedback && (
                  <Flex direction="column" gap="xs">
                    <Text variant="caption">Feedback:</Text>
                    <Text>{question.feedback}</Text>
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
        ) : (
          // Active interview view
          <Flex direction="column" gap="l">
            {/* Current question */}
            <Flex direction="column" gap="m">
              <Text variant="label">
                {currentQuestion.type === 'technical' 
                  ? `Technical Question (${currentQuestion.skill})` 
                  : 'General Question'}
              </Text>
              <Text fontWeight="semiBold" fontSize="l">
                {currentQuestion.question}
              </Text>
            </Flex>

            {/* Response area */}
            {!readOnly && (
              <Flex direction="column" gap="m">
                <Textarea
                  placeholder="Type your answer here..."
                  minRows={5}
                  value={currentResponse || responses[currentQuestion.id] || ''}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  disabled={isSubmitting}
                />

                <Flex justifyContent="space-between">
                  <Button
                    variant="secondary"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                  >
                    Previous
                  </Button>

                  <Flex gap="m">
                    {currentQuestionIndex < interview.questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={handleNextQuestion}
                        disabled={isSubmitting}
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        icon={<IconSend />}
                        onClick={handleSubmitInterview}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Interview'}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    Text,
    VStack,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../supabase/config';

interface HRLoginForm {
  email: string;
  password: string;
}

interface CandidateApplicationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
}

export default function LandingPage() {
  const [isHRLogin, setIsHRLogin] = useState(true);
  const toast = useToast();

  // HR Login form
  const {
    register: registerHR,
    handleSubmit: handleSubmitHR,
    formState: { errors: errorsHR, isSubmitting: isSubmittingHR },
  } = useForm<HRLoginForm>();

  // Candidate Application form
  const {
    register: registerCandidate,
    handleSubmit: handleSubmitCandidate,
    formState: { errors: errorsCandidate, isSubmitting: isSubmittingCandidate },
  } = useForm<CandidateApplicationForm>();

  const onSubmitHRLogin = async (data: HRLoginForm) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Redirect or update UI accordingly
      }
    } catch (err) {
      toast({
        title: 'Unexpected error',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onSubmitCandidateApplication = async (
    data: CandidateApplicationForm,
  ) => {
    try {
      // Here you would typically send data to your backend API to create candidate record
      // For demo, just show success toast
      toast({
        title: 'Application submitted',
        description:
          'Thank you for applying. We will review your application shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Reset form or redirect as needed
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">
        Welcome to the HR Talent Platform
      </Heading>
      <Flex justify="center" mb={8}>
        <Button
          colorScheme={isHRLogin ? 'blue' : 'gray'}
          mr={4}
          onClick={() => setIsHRLogin(true)}
        >
          HR Login
        </Button>
        <Button
          colorScheme={!isHRLogin ? 'blue' : 'gray'}
          onClick={() => setIsHRLogin(false)}
        >
          Candidate Application
        </Button>
      </Flex>

      {isHRLogin ? (
        <Box as="form" onSubmit={handleSubmitHR(onSubmitHRLogin)} noValidate>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errorsHR.email} isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="hr@example.com"
                {...registerHR('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              <FormErrorMessage>
                {errorsHR.email && errorsHR.email.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errorsHR.password} isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...registerHR('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <FormErrorMessage>
                {errorsHR.password && errorsHR.password.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmittingHR}
              loadingText="Logging in"
            >
              Login
            </Button>
          </VStack>
        </Box>
      ) : (
        <Box
          as="form"
          onSubmit={handleSubmitCandidate(onSubmitCandidateApplication)}
          noValidate
        >
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errorsCandidate.firstName} isRequired>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <Input
                id="firstName"
                placeholder="First Name"
                {...registerCandidate('firstName', {
                  required: 'First name is required',
                })}
              />
              <FormErrorMessage>
                {errorsCandidate.firstName && errorsCandidate.firstName.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errorsCandidate.lastName} isRequired>
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <Input
                id="lastName"
                placeholder="Last Name"
                {...registerCandidate('lastName', {
                  required: 'Last name is required',
                })}
              />
              <FormErrorMessage>
                {errorsCandidate.lastName && errorsCandidate.lastName.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errorsCandidate.email} isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...registerCandidate('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              <FormErrorMessage>
                {errorsCandidate.email && errorsCandidate.email.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errorsCandidate.phone}>
              <FormLabel htmlFor="phone">Phone</FormLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="(Optional) Phone number"
                {...registerCandidate('phone')}
              />
              <FormErrorMessage>
                {errorsCandidate.phone && errorsCandidate.phone.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="resumeUrl">Resume URL</FormLabel>
              <Input
                id="resumeUrl"
                type="url"
                placeholder="Link to your resume (e.g., Google Drive, Dropbox)"
                {...registerCandidate('resumeUrl', {
                  required: 'Resume URL is required',
                  pattern: {
                    value: /^(https?:\/\/[^\s]+)$/,
                    message: 'Invalid URL',
                  },
                })}
              />
              <FormErrorMessage>
                {errorsCandidate.resumeUrl && errorsCandidate.resumeUrl.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmittingCandidate}
              loadingText="Submitting"
            >
              Submit Application
            </Button>
          </VStack>
          <Text fontSize="sm" mt={4} color="gray.600">
            By submitting your application, you agree to our privacy policy and
            terms of use.
          </Text>
        </Box>
      )}
    </Container>
  );
}

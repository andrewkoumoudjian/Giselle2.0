import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationEntity } from '../entities/application.entity';
import { CandidateEntity } from '../entities/candidate.entity';
import { InterviewEntity } from '../entities/interview.entity';
import { JobPostingEntity } from '../entities/job-posting.entity';
import { AiService } from './ai/ai.service';
import { InterviewQuestionGeneratorService } from './interview-question-generator/interview-question-generator.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewEntity)
    private interviewRepository: Repository<InterviewEntity>,
    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,
    @InjectRepository(CandidateEntity)
    private candidateRepository: Repository<CandidateEntity>,
    private aiService: AiService,
    private interviewQuestionGenerator: InterviewQuestionGeneratorService,
  ) {}

  async findAll(): Promise<InterviewEntity[]> {
    return this.interviewRepository.find({
      relations: ['application', 'application.candidate', 'application.jobPosting'],
    });
  }

  async findById(id: string): Promise<InterviewEntity> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'application.candidate', 'application.jobPosting'],
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async findByApplicationId(applicationId: string): Promise<InterviewEntity[]> {
    return this.interviewRepository.find({
      where: { applicationId },
      relations: ['application', 'application.candidate', 'application.jobPosting'],
    });
  }

  async create(interviewData: Partial<InterviewEntity>): Promise<InterviewEntity> {
    // Generate interview questions based on job requirements
    const application = await this.applicationRepository.findOne({
      where: { id: interviewData.applicationId },
      relations: ['jobPosting', 'candidate'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${interviewData.applicationId} not found`);
    }

    // Generate questions based on job requirements and candidate skills using LangChain
    const questions = await this.generateInterviewQuestions(
      application.jobPosting.id,
      application.candidate.id
    );

    const interview = this.interviewRepository.create({
      ...interviewData,
      questions,
      status: interviewData.status || 'scheduled',
    });

    return this.interviewRepository.save(interview);
  }

  async update(id: string, interviewData: Partial<InterviewEntity>): Promise<InterviewEntity> {
    await this.interviewRepository.update(id, interviewData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: string): Promise<InterviewEntity> {
    await this.interviewRepository.update(id, { status });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.interviewRepository.delete(id);
  }

  // Generate interview questions based on job requirements and candidate skills using LangChain
  async generateInterviewQuestions(jobPostingId: string, candidateId?: string): Promise<any[]> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      return [];
    }

    let candidateSkills: string[] = [];
    
    // If candidateId is provided, get the candidate's skills
    if (candidateId) {
      const candidate = await this.candidateRepository.findOne({
        where: { id: candidateId },
      });
      if (candidate) {
        candidateSkills = candidate.skills || [];
      }
    }

    try {
      // Use LangChain-based interview question generator
      return await this.interviewQuestionGenerator.generateQuestions(
        jobPosting.title,
        jobPosting.requiredSkills || [],
        candidateSkills
      );
    } catch (error) {
      // Fall back to the legacy AI service if LangChain fails
      return this.aiService.generateInterviewQuestions(
        jobPosting.title,
        jobPosting.requiredSkills || []
      );
    }
  }

  // Generate questions using the legacy method (keeping for backward compatibility)
  async generateInterviewQuestionsLegacy(jobPostingId: string): Promise<any[]> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      return [];
    }

    // Use legacy AI service to generate questions
    return this.aiService.generateInterviewQuestions(
      jobPosting.title, 
      jobPosting.requiredSkills || []
    );
  }

  // Evaluate interview responses using AI
  async evaluateResponses(interviewId: string, responses: Array<{ questionId: string, response: string }>): Promise<InterviewEntity> {
    const interview = await this.findById(interviewId);
    
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }
    
    const jobTitle = interview.application.jobPosting.title;
    
    // Define a proper type for questions
    interface InterviewQuestion {
      id: string;
      question: string;
      type?: 'general' | 'technical' | 'behavioral';
      skill?: string;
      response?: string;
      score?: number;
      feedback?: string;
    }
    
    // Ensure questions array is typed correctly
    const questions = Array.isArray(interview.questions) 
      ? interview.questions as InterviewQuestion[]
      : [] as InterviewQuestion[];
    
    // Update the responses and evaluate each one using AI
    const updatedQuestions = await Promise.all(
      questions.map(async (question) => {
        const responseEntry = responses.find(r => r.questionId === question.id);
        if (responseEntry) {
          // Get the skill associated with this question if it's a technical question
          const skill = question.type === 'technical' ? question.skill : undefined;
          
          // Evaluate the response using AI
          const evaluation = await this.aiService.evaluateResponse(
            question.question,
            responseEntry.response,
            jobTitle,
            skill
          );
          
          return {
            ...question,
            response: responseEntry.response,
            score: evaluation.score,
            feedback: evaluation.feedback,
          };
        }
        return question;
      })
    );
    
    // Calculate overall score
    const answeredQuestions = updatedQuestions.filter(q => q.score !== undefined);
    const overallScore = answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length * 20 // Scale to 0-100
      : null;
    
    // Update interview with responses and scores
    await this.interviewRepository.update(interviewId, {
      questions: updatedQuestions,
      overallScore: overallScore || undefined,
      status: 'completed',
    });
    
    return this.findById(interviewId);
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationEntity } from '../entities/application.entity';
import { InterviewEntity } from '../entities/interview.entity';
import { JobPostingEntity } from '../entities/job-posting.entity';
import { AiService } from './ai/ai.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewEntity)
    private interviewRepository: Repository<InterviewEntity>,
    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,
    private aiService: AiService,
  ) {}

  async findAll(): Promise<InterviewEntity[]> {
    return this.interviewRepository.find({
      relations: ['application', 'application.candidate', 'application.jobPosting'],
    });
  }

  async findById(id: string): Promise<InterviewEntity> {
    return this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'application.candidate', 'application.jobPosting'],
    });
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
      relations: ['jobPosting'],
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Generate questions based on job requirements
    const questions = await this.generateInterviewQuestions(application.jobPosting.id);

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

  // Generate interview questions based on job requirements using AI
  async generateInterviewQuestions(jobPostingId: string): Promise<any[]> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      return [];
    }

    // Use AI service to generate questions based on job title and required skills
    return this.aiService.generateInterviewQuestions(
      jobPosting.title, 
      jobPosting.requiredSkills || []
    );
  }

  // Evaluate interview responses using AI
  async evaluateResponses(interviewId: string, responses: Array<{ questionId: string, response: string }>): Promise<InterviewEntity> {
    const interview = await this.findById(interviewId);
    
    if (!interview) {
      throw new Error('Interview not found');
    }
    
    const jobTitle = interview.application.jobPosting.title;
    
    // Update the responses and evaluate each one using AI
    const updatedQuestions = await Promise.all(
      interview.questions.map(async (question) => {
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
      ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length * 20 // Scale to 0-100
      : null;
    
    // Update interview with responses and scores
    await this.interviewRepository.update(interviewId, {
      questions: updatedQuestions,
      overallScore,
      status: 'completed',
    });
    
    return this.findById(interviewId);
  }
}
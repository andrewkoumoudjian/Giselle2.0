import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobPostingEntity } from '../entities/job-posting.entity';
import { AiService } from './ai/ai.service';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,
    private aiService: AiService,
  ) {}

  async findAll(): Promise<JobPostingEntity[]> {
    return this.jobPostingRepository.find();
  }

  async findById(id: string): Promise<JobPostingEntity> {
    return this.jobPostingRepository.findOne({ where: { id } });
  }

  async findActive(): Promise<JobPostingEntity[]> {
    return this.jobPostingRepository.find({ where: { status: 'active' } });
  }

  async create(jobPostingData: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    // If description is provided but requiredSkills is not, extract skills automatically
    if (jobPostingData.description && !jobPostingData.requiredSkills) {
      jobPostingData.requiredSkills = await this.analyzeJobRequirements(jobPostingData.description);
    }

    const jobPosting = this.jobPostingRepository.create({
      ...jobPostingData,
      status: jobPostingData.status || 'active',
    });
    return this.jobPostingRepository.save(jobPosting);
  }

  async update(id: string, jobPostingData: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    // If description is updated, also update the required skills
    if (jobPostingData.description && !jobPostingData.requiredSkills) {
      jobPostingData.requiredSkills = await this.analyzeJobRequirements(jobPostingData.description);
    }
    
    await this.jobPostingRepository.update(id, jobPostingData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.jobPostingRepository.delete(id);
  }

  async closeJobPosting(id: string): Promise<JobPostingEntity> {
    await this.jobPostingRepository.update(id, { status: 'closed' });
    return this.findById(id);
  }

  // Method to analyze job requirements and extract key skills using AI
  async analyzeJobRequirements(description: string): Promise<string[]> {
    return this.aiService.analyzeJobRequirements(description);
  }
}
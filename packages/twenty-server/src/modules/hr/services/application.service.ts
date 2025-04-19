import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationEntity } from '../entities/application.entity';
import { CandidateEntity } from '../entities/candidate.entity';
import { JobPostingEntity } from '../entities/job-posting.entity';
import { JobMatcherService } from './job-matcher/job-matcher.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(CandidateEntity)
    private candidateRepository: Repository<CandidateEntity>,
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,
    private jobMatcherService: JobMatcherService,
  ) {}

  async findAll(): Promise<ApplicationEntity[]> {
    return this.applicationRepository.find({
      relations: ['candidate', 'jobPosting'],
    });
  }

  async findById(id: string): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['candidate', 'jobPosting'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findByCandidateId(candidateId: string): Promise<ApplicationEntity[]> {
    return this.applicationRepository.find({
      where: { candidateId },
      relations: ['jobPosting'],
    });
  }

  async findByJobPostingId(jobPostingId: string): Promise<ApplicationEntity[]> {
    return this.applicationRepository.find({
      where: { jobPostingId },
      relations: ['candidate'],
    });
  }

  async create(applicationData: Partial<ApplicationEntity>): Promise<ApplicationEntity> {
    // Validate required fields
    if (!applicationData.candidateId || !applicationData.jobPostingId) {
      throw new BadRequestException('candidateId and jobPostingId are required');
    }

    // Calculate match score between candidate and job posting using LangChain
    const matchScore = await this.calculateMatchScore(
      applicationData.candidateId,
      applicationData.jobPostingId,
    );

    const application = this.applicationRepository.create({
      ...applicationData,
      matchScore,
      status: applicationData.status || 'pending',
    });

    return this.applicationRepository.save(application);
  }

  async update(id: string, applicationData: Partial<ApplicationEntity>): Promise<ApplicationEntity> {
    await this.applicationRepository.update(id, applicationData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: string): Promise<ApplicationEntity> {
    await this.applicationRepository.update(id, { status });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.applicationRepository.delete(id);
  }

  // Calculate match score between candidate and job posting using LangChain
  async calculateMatchScore(candidateId: string, jobPostingId: string): Promise<number> {
    const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
    const jobPosting = await this.jobPostingRepository.findOne({ where: { id: jobPostingId } });

    if (!candidate || !jobPosting) {
      return 0;
    }

    // Use LangChain-based job matcher service
    const candidateSkills = candidate.skills || [];
    const requiredSkills = jobPosting.requiredSkills || [];

    // If no required skills are specified, fall back to a default score
    if (requiredSkills.length === 0) {
      return 50; // Default mid-range score if no required skills specified
    }

    try {
      // Use the LangChain-based matcher for a more sophisticated match
      const matchResult = await this.jobMatcherService.matchCandidateToJob(
        candidateSkills,
        requiredSkills
      );

      // Store additional match details in the application's metadata field if needed
      // (This would require updating the ApplicationEntity to include a metadata field)

      return matchResult.score;
    } catch (error) {
      // Fall back to the simple matching algorithm if LangChain fails
      return this.calculateSimpleMatchScore(candidateSkills, requiredSkills);
    }
  }

  // Simple matching algorithm as a fallback
  private calculateSimpleMatchScore(
    candidateSkills: string[],
    requiredSkills: string[]
  ): number {
    // Count matching skills
    const matchingSkills = candidateSkills.filter(skill => 
      requiredSkills.some(reqSkill => 
        reqSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    // Calculate percentage match
    const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    
    // Cap at 100
    return Math.min(matchPercentage, 100);
  }
}
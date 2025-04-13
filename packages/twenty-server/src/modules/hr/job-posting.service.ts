import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiService } from '../ai/ai.service';
import { WorkspaceMemberService } from '../workspace-member/workspace-member.service';
import { CreateJobPostingInput } from './dto/create-job-posting.input';
import { UpdateJobPostingInput } from './dto/update-job-posting.input';
import { JobPostingEntity } from './job-posting.entity';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepository: Repository<JobPostingEntity>,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly aiService: AiService,
  ) {}

  async findAll(workspaceId: string): Promise<JobPostingEntity[]> {
    return this.jobPostingRepository.find({
      where: { workspaceId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<JobPostingEntity> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id, workspaceId },
      relations: ['createdBy'],
    });

    if (!jobPosting) {
      throw new NotFoundException(`Job posting with id ${id} not found`);
    }

    return jobPosting;
  }

  async create(
    data: CreateJobPostingInput,
    workspaceId: string,
    userId: string,
  ): Promise<JobPostingEntity> {
    const workspaceMember = await this.workspaceMemberService.findByUserId(userId, workspaceId);

    // Extract skills from job description using AI if requiredSkills not provided
    let requiredSkills = data.requiredSkills;
    if (!requiredSkills && data.description) {
      requiredSkills = await this.extractSkillsFromDescription(data.description);
    }

    const jobPosting = this.jobPostingRepository.create({
      ...data,
      requiredSkills,
      workspaceId,
      createdById: workspaceMember.id,
    });

    return this.jobPostingRepository.save(jobPosting);
  }

  async update(
    id: string,
    data: UpdateJobPostingInput,
    workspaceId: string,
  ): Promise<JobPostingEntity> {
    // Find existing job posting
    const jobPosting = await this.findById(id, workspaceId);

    // If description is updated but requiredSkills is not, extract skills from new description
    if (data.description && !data.requiredSkills) {
      data.requiredSkills = await this.extractSkillsFromDescription(data.description);
    }

    // Update fields
    Object.assign(jobPosting, data);
    
    return this.jobPostingRepository.save(jobPosting);
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const jobPosting = await this.findById(id, workspaceId);
    const result = await this.jobPostingRepository.remove(jobPosting);
    return !!result;
  }

  // Helper method to extract skills from job description using AI
  private async extractSkillsFromDescription(description: string): Promise<string[]> {
    try {
      const response = await this.aiService.extractSkillsFromText(description);
      return response.skills || [];
    } catch (error) {
      console.error('Error extracting skills from description:', error);
      return [];
    }
  }
}
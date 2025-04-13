import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CandidateEntity } from '../entities/candidate.entity';
import { AiService } from './ai/ai.service';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(CandidateEntity)
    private candidateRepository: Repository<CandidateEntity>,
    private aiService: AiService,
  ) {}

  async findAll(): Promise<CandidateEntity[]> {
    return this.candidateRepository.find();
  }

  async findById(id: string): Promise<CandidateEntity> {
    return this.candidateRepository.findOne({ where: { id } });
  }

  async create(candidateData: Partial<CandidateEntity>): Promise<CandidateEntity> {
    const candidate = this.candidateRepository.create(candidateData);
    return this.candidateRepository.save(candidate);
  }

  async update(id: string, candidateData: Partial<CandidateEntity>): Promise<CandidateEntity> {
    await this.candidateRepository.update(id, candidateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.candidateRepository.delete(id);
  }

  // AI-powered resume analysis
  async analyzeResume(resumeText: string): Promise<{
    skills: string[];
    experienceYears: number;
    resumeData: Record<string, any>;
  }> {
    return this.aiService.analyzeResume(resumeText);
  }

  // Create candidate from resume analysis
  async createFromResume(resumeText: string, userId?: string): Promise<CandidateEntity> {
    const analysis = await this.analyzeResume(resumeText);
    
    const candidateData: Partial<CandidateEntity> = {
      userId,
      skills: analysis.skills,
      experienceYears: analysis.experienceYears,
      resumeData: analysis.resumeData,
    };
    
    return this.create(candidateData);
  }
}
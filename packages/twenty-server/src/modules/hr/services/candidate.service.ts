import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CandidateEntity } from '../entities/candidate.entity';
import { AiService } from './ai/ai.service';
import { ResumeProcessorService } from './resume-processor/resume-processor.service';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(CandidateEntity)
    private candidateRepository: Repository<CandidateEntity>,
    private aiService: AiService,
    private resumeProcessorService: ResumeProcessorService,
  ) {}

  async findAll(): Promise<CandidateEntity[]> {
    return this.candidateRepository.find();
  }

  async findById(id: string): Promise<CandidateEntity> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    
    return candidate;
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

  // AI-powered resume analysis using LangChain
  async analyzeResume(resumeText: string): Promise<{
    skills: string[];
    experienceYears: number;
    resumeData: Record<string, any>;
  }> {
    // Use the new LangChain-based resume processor
    return this.resumeProcessorService.analyzeResume(resumeText);
  }

  // Legacy resume analysis (using the old service)
  async analyzeResumeLegacy(resumeText: string): Promise<{
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
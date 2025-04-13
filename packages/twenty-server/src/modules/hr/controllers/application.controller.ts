import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApplicationEntity } from '../entities/application.entity';
import { ApplicationService } from '../services/application.service';

@Controller('api/hr/applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async findAll(): Promise<ApplicationEntity[]> {
    return this.applicationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApplicationEntity> {
    return this.applicationService.findById(id);
  }

  @Get('candidate/:candidateId')
  async findByCandidateId(@Param('candidateId') candidateId: string): Promise<ApplicationEntity[]> {
    return this.applicationService.findByCandidateId(candidateId);
  }

  @Get('job-posting/:jobPostingId')
  async findByJobPostingId(@Param('jobPostingId') jobPostingId: string): Promise<ApplicationEntity[]> {
    return this.applicationService.findByJobPostingId(jobPostingId);
  }

  @Post()
  async create(@Body() applicationData: Partial<ApplicationEntity>): Promise<ApplicationEntity> {
    return this.applicationService.create(applicationData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() applicationData: Partial<ApplicationEntity>,
  ): Promise<ApplicationEntity> {
    return this.applicationService.update(id, applicationData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: string },
  ): Promise<ApplicationEntity> {
    return this.applicationService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.applicationService.delete(id);
  }

  @Get(':candidateId/:jobPostingId/match-score')
  async getMatchScore(
    @Param('candidateId') candidateId: string,
    @Param('jobPostingId') jobPostingId: string,
  ): Promise<{ matchScore: number }> {
    const score = await this.applicationService.calculateMatchScore(candidateId, jobPostingId);
    return { matchScore: score };
  }
}
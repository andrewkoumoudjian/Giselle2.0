import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { JobPostingEntity } from '../entities/job-posting.entity';
import { JobPostingService } from '../services/job-posting.service';

@Controller('api/hr/job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Get()
  async findAll(): Promise<JobPostingEntity[]> {
    return this.jobPostingService.findAll();
  }

  @Get('active')
  async findActive(): Promise<JobPostingEntity[]> {
    return this.jobPostingService.findActive();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<JobPostingEntity> {
    return this.jobPostingService.findById(id);
  }

  @Post()
  async create(@Body() jobPostingData: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.jobPostingService.create(jobPostingData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() jobPostingData: Partial<JobPostingEntity>,
  ): Promise<JobPostingEntity> {
    return this.jobPostingService.update(id, jobPostingData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.jobPostingService.delete(id);
  }

  @Post(':id/close')
  async closeJobPosting(@Param('id') id: string): Promise<JobPostingEntity> {
    return this.jobPostingService.closeJobPosting(id);
  }

  @Post('analyze-requirements')
  async analyzeJobRequirements(@Body() { description }: { description: string }): Promise<string[]> {
    return this.jobPostingService.analyzeJobRequirements(description);
  }
}
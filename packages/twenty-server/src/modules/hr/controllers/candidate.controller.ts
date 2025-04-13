import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CandidateEntity } from '../entities/candidate.entity';
import { CandidateService } from '../services/candidate.service';

@Controller('api/hr/candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  async findAll(): Promise<CandidateEntity[]> {
    return this.candidateService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CandidateEntity> {
    return this.candidateService.findById(id);
  }

  @Post()
  async create(@Body() candidateData: Partial<CandidateEntity>): Promise<CandidateEntity> {
    return this.candidateService.create(candidateData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() candidateData: Partial<CandidateEntity>,
  ): Promise<CandidateEntity> {
    return this.candidateService.update(id, candidateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.candidateService.delete(id);
  }

  @Post('resume/analyze')
  @UseInterceptors(FileInterceptor('resume'))
  async analyzeResume(@UploadedFile() resume: Express.Multer.File): Promise<any> {
    // Extract text from uploaded resume file
    // This is a placeholder - in a real implementation, we would use a library to extract text from PDF/DOCX
    const resumeText = resume.buffer.toString();
    
    return this.candidateService.analyzeResume(resumeText);
  }
}
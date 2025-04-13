import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { InterviewEntity } from '../entities/interview.entity';
import { InterviewService } from '../services/interview.service';

@Controller('api/hr/interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get()
  async findAll(): Promise<InterviewEntity[]> {
    return this.interviewService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<InterviewEntity> {
    return this.interviewService.findById(id);
  }

  @Get('application/:applicationId')
  async findByApplicationId(@Param('applicationId') applicationId: string): Promise<InterviewEntity[]> {
    return this.interviewService.findByApplicationId(applicationId);
  }

  @Post()
  async create(@Body() interviewData: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.interviewService.create(interviewData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() interviewData: Partial<InterviewEntity>,
  ): Promise<InterviewEntity> {
    return this.interviewService.update(id, interviewData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: string },
  ): Promise<InterviewEntity> {
    return this.interviewService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.interviewService.delete(id);
  }

  @Post(':id/evaluate')
  async evaluateResponses(
    @Param('id') id: string,
    @Body() { responses }: { responses: Array<{ questionId: string, response: string }> },
  ): Promise<InterviewEntity> {
    return this.interviewService.evaluateResponses(id, responses);
  }
}
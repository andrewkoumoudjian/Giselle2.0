import { Controller, Get } from '@nestjs/common';

import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplications() {
    return this.applicationsService.getApplications();
  }
:start_line:13
-------
}

import { Body, Param, Post } from '@nestjs/common';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplications() {
    return this.applicationsService.getApplications();
  }

  @Post(':id/schedule-interview')
  async scheduleInterview(
    @Param('id') applicationId: string,
    @Body() scheduleDto: { date: string; time: string; mode: string },
  ) {
    return this.applicationsService.scheduleInterview(applicationId, scheduleDto);
  }
}

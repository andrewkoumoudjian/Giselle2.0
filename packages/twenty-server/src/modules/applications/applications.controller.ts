import { Controller, Get } from '@nestjs/common';

import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplications() {
    return this.applicationsService.getApplications();
  }
}

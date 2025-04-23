import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ApplicationsService } from './applications.service';

@Controller('applications/advanced')
export class ApplicationsAdvancedController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(':id/schedule-interview')
  async scheduleInterview(
    @Param('id') applicationId: string,
    @Body()
    scheduleDto: { date: string; time: string; mode: string },
  ) {
    return this.applicationsService.scheduleInterview(
      applicationId,
      scheduleDto,
    );
  }

  @Post('compare')
  async compareCandidates(
    @Body()
    body: {
      candidateAId: string;
      candidateBId: string;
    },
  ) {
    return this.applicationsService.candidateComparison(
      body.candidateAId,
      body.candidateBId,
    );
  }

  @Get('analytics')
  async getAnalytics() {
    return this.applicationsService.getAnalyticsData();
  }

  @Post('email')
  async sendEmail(
    @Body()
    body: {
      recipientEmail: string;
      subject: string;
      body: string;
    },
  ) {
    return this.applicationsService.sendEmailNotification(
      body.recipientEmail,
      body.subject,
      body.body,
    );
  }

  @Post('feedback')
  async submitFeedback(
    @Body()
    body: {
      applicationId: string;
      feedbackText: string;
      submittedBy: string;
    },
  ) {
    return this.applicationsService.collectFeedback(
      body.applicationId,
      body.feedbackText,
      body.submittedBy,
    );
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from './entities/application.entity';
import { CandidateEntity } from './entities/candidate.entity';
import { InterviewEntity } from './entities/interview.entity';
import { JobPostingEntity } from './entities/job-posting.entity';

import { AiService } from './services/ai/ai.service';
import { ApplicationService } from './services/application.service';
import { CandidateService } from './services/candidate.service';
import { InterviewService } from './services/interview.service';
import { JobPostingService } from './services/job-posting.service';

import { ApplicationController } from './controllers/application.controller';
import { CandidateController } from './controllers/candidate.controller';
import { InterviewController } from './controllers/interview.controller';
import { JobPostingController } from './controllers/job-posting.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CandidateEntity,
      JobPostingEntity,
      ApplicationEntity,
      InterviewEntity,
    ]),
  ],
  providers: [
    CandidateService,
    JobPostingService,
    ApplicationService,
    InterviewService,
    AiService,
  ],
  controllers: [
    CandidateController,
    JobPostingController,
    ApplicationController,
    InterviewController,
  ],
  exports: [
    CandidateService,
    JobPostingService,
    ApplicationService,
    InterviewService,
    AiService,
  ],
})
export class HrModule {}
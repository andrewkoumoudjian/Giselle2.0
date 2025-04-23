import { Module } from '@nestjs/common';

import { ApplicationsAdvancedController } from './applications-advanced.controller';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController, ApplicationsAdvancedController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}

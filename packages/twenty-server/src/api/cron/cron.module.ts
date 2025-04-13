import { Module } from '@nestjs/common';

import { MessagingCronController } from './messaging-cron.controller';

@Module({
  controllers: [MessagingCronController],
})
export class CronModule {}
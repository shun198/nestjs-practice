import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleProcessor } from './schedule.processor';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'schedule',
    }),
    EmailModule,
    UsersModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleProcessor],
})
export class ScheduleModule {}

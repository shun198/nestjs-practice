import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleProcessor } from './schedule.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'schedule',
    }),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleProcessor],
})
export class ScheduleModule {}
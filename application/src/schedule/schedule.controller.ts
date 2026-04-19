import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('schedule')
@Controller('api/schedule')
export class ScheduleController {
  constructor(@InjectQueue('schedule') private readonly scheduleQueue: Queue) {}

  @Post('')
  async schedule() {
    await this.scheduleQueue.add('schedule', {
      schedule: 'schedule',
    });
  }
}
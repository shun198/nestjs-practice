import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class ScheduleService {
  constructor(@InjectQueue('schedule') private scheduleQueue: Queue) { }

  public async schedule(): Promise<string> {
    const job = await this.scheduleQueue.add('schedule', { schedule: 'schedule' });
    console.log('Job Added', job.name, job.queueName);
    return `Job Added ${job.name}`;
  }
}
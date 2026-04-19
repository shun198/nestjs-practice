import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RepeatableEmailDto } from '../dto/repeatable-email.dto';
import { ScheduleEmailDto } from '../dto/schedule-email.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectQueue('schedule') private scheduleQueue: Queue,
    private readonly usersService: UsersService,
  ) {}

  async scheduleWelcomeEmail(dto: ScheduleEmailDto): Promise<string> {
    return this.enqueue('send-welcome-email', dto);
  }

  async registerRepeatableWelcomeEmail(
    dto: RepeatableEmailDto,
  ): Promise<string> {
    return this.enqueueRepeatable('send-welcome-email', dto);
  }

  async cancelRepeatableEmail(id: string): Promise<void> {
    await this.scheduleQueue.removeJobScheduler(id);
  }

  async getRepeatableJobs() {
    return this.scheduleQueue.getJobSchedulers();
  }

  private async enqueue(
    jobName: string,
    dto: ScheduleEmailDto,
  ): Promise<string> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`Email ${dto.email} is not registered`);
    }

    const delay = new Date(dto.sendAt).getTime() - Date.now();
    if (delay < 0) {
      throw new Error('sendAt must be a future date');
    }

    const job = await this.scheduleQueue.add(
      jobName,
      { email: dto.email },
      { delay },
    );
    return `Job scheduled: ${job.id} (delay: ${Math.round(delay / 1000)}s)`;
  }

  private async enqueueRepeatable(
    jobName: string,
    dto: RepeatableEmailDto,
  ): Promise<string> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`Email ${dto.email} is not registered`);
    }

    const schedulerId = `${jobName}:${dto.email}`;
    await this.scheduleQueue.upsertJobScheduler(
      schedulerId,
      { pattern: dto.cronPattern },
      { name: jobName, data: { email: dto.email } },
    );
    return `Repeatable job registered: ${schedulerId} (pattern: ${dto.cronPattern})`;
  }
}

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ScheduleEmailDto } from '../dto/schedule-email.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectQueue('schedule') private scheduleQueue: Queue,
    private readonly usersService: UsersService,
  ) {}

  async scheduleEmail(dto: ScheduleEmailDto): Promise<string> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`Email ${dto.email} is not registered`);
    }

    const delay = new Date(dto.sendAt).getTime() - Date.now();
    if (delay < 0) {
      throw new Error('sendAt must be a future date');
    }

    const job = await this.scheduleQueue.add(
      'send-welcome-email',
      { email: dto.email },
      { delay },
    );
    return `Job scheduled: ${job.id} (delay: ${Math.round(delay / 1000)}s)`;
  }
}

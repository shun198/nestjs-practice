import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../email/email.service';

@Injectable()
@Processor('schedule')
export class ScheduleProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduleProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name} (id: ${job.id})`);

    switch (job.name) {
      case 'send-welcome-email':
        await this.emailService.sendWelcomeEmail(job.data.email);
        this.logger.log(`Welcome email sent to ${job.data.email}`);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}

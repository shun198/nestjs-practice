import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
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
    await this.emailService.sendWelcomeEmail(job.data.email);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email sent to ${job.data.email} (job: ${job.name})`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed to send email to ${job.data.email} (job: ${job.name}): ${error.message}`,
    );
  }
}

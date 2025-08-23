import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async welcomeEmail(email: string) {
    const subject = `ようこそ`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './welcome',
    });
  }
}


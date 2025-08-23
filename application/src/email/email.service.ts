import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(email: string) {
    const subject = `ようこそ`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './welcome',
    });
  }

  async sendChangePasswordEmail(email: string) {
    const subject = `パスワード変更`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './change-password',
    });
  }

  async sendResetPasswordEmail(email: string) {
    const subject = `パスワードリセット`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './reset-password',
    });
  }
}


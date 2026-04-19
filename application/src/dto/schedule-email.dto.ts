import { IsEmail, IsISO8601 } from 'class-validator';

export class ScheduleEmailDto {
  @IsEmail()
  email: string;

  @IsISO8601()
  sendAt: string; // ISO 8601形式 例: "2026-04-20T09:00:00.000Z"
}

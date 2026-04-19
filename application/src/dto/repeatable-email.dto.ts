import { IsEmail, IsString } from 'class-validator';

export class RepeatableEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  cronPattern: string; // cron式 例: '0 0 * * *' = UTC 0:00（JST 9:00）毎日
}

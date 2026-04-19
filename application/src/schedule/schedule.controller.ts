import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScheduleEmailDto } from '../dto/schedule-email.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@Controller('api/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('email')
  @ApiBody({
    type: ScheduleEmailDto,
    description: '指定時刻にウェルカムメールを送信するジョブを登録する',
    examples: {
      example: {
        value: {
          email: 'user@example.com',
          sendAt: '2026-04-20T09:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'メール送信ジョブを登録しました',
    schema: { example: 'Job scheduled: 1 (delay: 3600s)' },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '指定されたメールアドレスが存在しません',
  })
  async scheduleEmail(@Body() dto: ScheduleEmailDto): Promise<string> {
    return this.scheduleService.scheduleEmail(dto);
  }
}

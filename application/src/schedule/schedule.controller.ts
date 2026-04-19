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
    examples: {
      example: { value: { email: 'john@example.com', sendAt: '2026-04-20T09:00:00.000Z' } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'ウェルカムメールのジョブを登録しました' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '指定されたメールアドレスが存在しません' })
  async scheduleWelcomeEmail(@Body() dto: ScheduleEmailDto): Promise<string> {
    return this.scheduleService.scheduleWelcomeEmail(dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RepeatableEmailDto } from '../dto/repeatable-email.dto';
import { ScheduleEmailDto } from '../dto/schedule-email.dto';
import { ScheduleService } from './schedule.service';

const scheduleEmailExample = {
  email: 'john@example.com',
  sendAt: '2026-04-20T09:00:00.000Z',
};
const repeatableEmailExample = {
  email: 'john@example.com',
  cronPattern: '0 0 * * *',
};

@ApiTags('schedule')
@Controller('api/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('email/welcome')
  @ApiBody({
    type: ScheduleEmailDto,
    examples: { example: { value: scheduleEmailExample } },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ウェルカムメールのジョブを登録しました',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '指定されたメールアドレスが存在しません',
  })
  async scheduleWelcomeEmail(@Body() dto: ScheduleEmailDto): Promise<string> {
    return this.scheduleService.scheduleWelcomeEmail(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('email/welcome/repeatable')
  @ApiBody({
    type: RepeatableEmailDto,
    examples: { example: { value: repeatableEmailExample } },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ウェルカムメールの定期ジョブを登録しました',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '指定されたメールアドレスが存在しません',
  })
  async registerRepeatableWelcomeEmail(
    @Body() dto: RepeatableEmailDto,
  ): Promise<string> {
    return this.scheduleService.registerRepeatableWelcomeEmail(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('email/repeatable')
  @ApiResponse({
    status: HttpStatus.OK,
    description: '登録済みの定期ジョブ一覧',
  })
  async getRepeatableJobs() {
    return this.scheduleService.getRepeatableJobs();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('email/repeatable/:id')
  @ApiParam({
    name: 'id',
    description: '定期ジョブのID (一覧取得APIの id フィールド参照)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '定期ジョブを削除しました',
  })
  async cancelRepeatableEmail(@Param('id') id: string): Promise<void> {
    await this.scheduleService.cancelRepeatableEmail(id);
  }
}

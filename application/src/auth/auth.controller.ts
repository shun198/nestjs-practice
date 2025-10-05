import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john' },
        password: { type: 'string', example: 'changeme' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful login',
    content: {
      'application/json': {
        example: [
          {
            access_token: "token_string",
          },
        ],
      },
    },
  })
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile',
    content: {
      'application/json': {
        example: [
          {
            username: "john",
            sub: 1,
            "iat": 1700000000,
            "exp": 1700003600
          },
        ],
      },
    },
  })
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

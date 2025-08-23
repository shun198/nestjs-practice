import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List users',
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            username: 'john',
            password: 'changeme',
            isActive: true,
          },
        ],
      },
    },
  })
  listUsers() {
    return this.usersService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List users',
    content: {
      'application/json': {
        example: {
            id: 1,
            username: 'john',
            password: 'changeme',
            isActive: true,
          },
      },
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    schema: { type: 'integer', example: 1 },
  })
  getUser(@Param() id: number) {
    const user = this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user
  }
}

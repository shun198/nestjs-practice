import {
  Body,
  Controller,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from '../entity/create-user.dto';

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
  async getUser(@Param('id') id: number) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiBody({
    type: CreateUserDto,
    description: 'ユーザー作成用のリクエストボディ',
    examples: {
      user: {
        value: {
          username: 'wada',
          password: 'changeme',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    content: {
      'application/json': {
        example: {
          id: 4,
          username: 'wada',
          password: '$2b$10$UvFrY2ifg7hrWLIY8udaPe3HgApQAjquTlgJTPkt.1h8YMJATncsu',
          isActive: false,
        },
      },
    },
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.findOneByUsername(createUserDto.username);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    return await this.usersService.createUser(createUserDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    schema: { type: 'integer', example: 1 },
  })
  async deleteUser(@Param('id') id: number) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.usersService.remove(id);
  }
}

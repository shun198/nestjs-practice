import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    findOneById: jest.Mock;
    findOneByUsername: jest.Mock;
    findOneByEmail: jest.Mock;
    createUser: jest.Mock;
    remove: jest.Mock;
  };

  const createUserDto: CreateUserDto = {
    username: 'john',
    email: 'john@example.com',
    password: 'secret',
    isActive: false,
    role: Role.General,
  };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      findOneByEmail: jest.fn(),
      createUser: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listUsers should return users', async () => {
    const users = [{ id: 1, username: 'john' }];
    usersService.findAll.mockResolvedValue(users);

    await expect(controller.listUsers()).resolves.toEqual(users);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  });

  it('getUser should return a user when found', async () => {
    const user = { id: 1, username: 'john' };
    usersService.findOneById.mockResolvedValue(user);

    await expect(controller.getUser(1)).resolves.toEqual(user);
    expect(usersService.findOneById).toHaveBeenCalledWith(1);
  });

  it('getUser should throw NotFoundException when missing', async () => {
    usersService.findOneById.mockResolvedValue(null);

    await expect(controller.getUser(1)).rejects.toThrow(NotFoundException);
  });

  it('createUser should create user when username and email are unique', async () => {
    const created = { id: 1, ...createUserDto };
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue(created);

    await expect(controller.createUser(createUserDto)).resolves.toEqual(
      created,
    );
    expect(usersService.findOneByUsername).toHaveBeenCalledWith(
      createUserDto.username,
    );
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(
      createUserDto.email,
    );
    expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
  });

  it('createUser should throw BadRequestException when username exists', async () => {
    usersService.findOneByUsername.mockResolvedValue({ id: 10 });

    await expect(controller.createUser(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('createUser should throw BadRequestException when email exists', async () => {
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue({ id: 10 });

    await expect(controller.createUser(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('deleteUser should remove user when found', async () => {
    usersService.findOneById.mockResolvedValue({ id: 1 });
    usersService.remove.mockResolvedValue(undefined);

    await expect(controller.deleteUser(1)).resolves.toBeUndefined();
    expect(usersService.remove).toHaveBeenCalledWith(1);
  });

  it('deleteUser should throw NotFoundException when user is missing', async () => {
    usersService.findOneById.mockResolvedValue(null);

    await expect(controller.deleteUser(1)).rejects.toThrow(NotFoundException);
    expect(usersService.remove).not.toHaveBeenCalled();
  });
});

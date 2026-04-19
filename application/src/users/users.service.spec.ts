import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, Role } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  const createUserDto: CreateUserDto = {
    username: 'john',
    email: 'john@example.com',
    password: 'plain-password',
    isActive: false,
    role: Role.General,
  };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all users', async () => {
    const users = [{ id: 1, username: 'john' }];
    repository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual(users);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('findOneByUsername should query by username', async () => {
    const user = { id: 1, username: 'john' };
    repository.findOne.mockResolvedValue(user);

    await expect(service.findOneByUsername('john')).resolves.toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { username: 'john' },
    });
  });

  it('findOneByEmail should query by email', async () => {
    const user = { id: 1, email: 'john@example.com' };
    repository.findOne.mockResolvedValue(user);

    await expect(service.findOneByEmail('john@example.com')).resolves.toEqual(
      user,
    );
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    });
  });

  it('findOneById should query by id', async () => {
    const user = { id: 1 };
    repository.findOne.mockResolvedValue(user);

    await expect(service.findOneById(1)).resolves.toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('createUser should hash password and persist user', async () => {
    jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    repository.create.mockImplementation((payload) => payload);
    repository.save.mockImplementation(async (payload) => ({
      id: 1,
      ...payload,
    }));

    const result = await service.createUser(createUserDto);

    expect(bcrypt.genSaltSync).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
    expect(repository.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: 'hashed-password',
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: 1,
      username: createUserDto.username,
      email: createUserDto.email,
      password: 'hashed-password',
    });
  });

  it('remove should delete by id', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});

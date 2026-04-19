import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../entity/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOneByUsername: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const userRecord = {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    password: 'hashed-password',
    isActive: true,
    role: Role.General,
  };

  beforeEach(async () => {
    usersService = { findOneByUsername: jest.fn() };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns user without password when credentials are valid', async () => {
      usersService.findOneByUsername.mockResolvedValue(userRecord);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('john', 'plain-password');

      expect(usersService.findOneByUsername).toHaveBeenCalledWith('john');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );
      expect(result).toEqual({
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        isActive: userRecord.isActive,
        role: userRecord.role,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('returns null when user is not found', async () => {
      usersService.findOneByUsername.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('ghost', 'whatever');

      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      usersService.findOneByUsername.mockResolvedValue(userRecord);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('john', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('signs a JWT with user claims', async () => {
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.login({
        id: 1,
        username: 'john',
        role: Role.Admin,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'john',
        userId: 1,
        role: Role.Admin,
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});

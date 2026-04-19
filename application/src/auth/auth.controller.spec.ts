import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../entity/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login returns the access token from AuthService', async () => {
    const user = { id: 1, username: 'john', role: Role.General };
    authService.login.mockResolvedValue({ access_token: 'signed-token' });

    const req = { user } as any;
    await expect(controller.login(req)).resolves.toEqual({
      access_token: 'signed-token',
    });
    expect(authService.login).toHaveBeenCalledWith(user);
  });

  it('getProfile returns req.user', () => {
    const user = { id: 1, username: 'john' };
    const req = { user } as any;

    expect(controller.getProfile(req)).toEqual(user);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { LocalAuthGuard } from '../../src/guards/local-auth.guard';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { Role } from '../../src/entity/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: { login: jest.Mock };

  const authUser = {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    role: Role.General,
  };

  beforeAll(async () => {
    authService = { login: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = authUser;
          return true;
        },
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = authUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login returns an access token', () => {
    authService.login.mockResolvedValue({ access_token: 'signed-token' });

    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'john', password: 'secret' })
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toEqual({ access_token: 'signed-token' });
        expect(authService.login).toHaveBeenCalledWith(authUser);
      });
  });

  it('GET /api/auth/profile returns the authenticated user', () => {
    return request(app.getHttpServer())
      .get('/api/auth/profile')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toEqual(authUser);
      });
  });
});

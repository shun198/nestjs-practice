import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/guards/roles.guard';
import { Role } from '../../src/entity/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let usersService: {
    findAll: jest.Mock;
    findOneById: jest.Mock;
    findOneByUsername: jest.Mock;
    findOneByEmail: jest.Mock;
    createUser: jest.Mock;
    remove: jest.Mock;
  };

  beforeAll(async () => {
    usersService = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      findOneByEmail: jest.fn(),
      createUser: jest.fn(),
      remove: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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

  it('GET /api/users returns user list', () => {
    usersService.findAll.mockResolvedValue([
      {
        id: 1,
        username: 'john',
        email: 'john@example.com',
        role: Role.General,
      },
    ]);

    return request(app.getHttpServer())
      .get('/api/users')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({ id: 1, username: 'john' });
      });
  });

  it('GET /api/users/:id returns a user', () => {
    usersService.findOneById.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@example.com',
    });

    return request(app.getHttpServer())
      .get('/api/users/1')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: 1, username: 'john' });
      });
  });

  it('GET /api/users/:id returns 404 when user not found', () => {
    usersService.findOneById.mockResolvedValue(null);

    return request(app.getHttpServer())
      .get('/api/users/999')
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toBe('User not found');
      });
  });

  it('POST /api/users creates a user', () => {
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue({
      id: 2,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed',
      isActive: false,
      role: Role.General,
    });

    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'plain',
        isActive: false,
        role: Role.General,
      })
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: 2, username: 'alice' });
      });
  });

  it('POST /api/users returns 400 when username exists', () => {
    usersService.findOneByUsername.mockResolvedValue({ id: 5 });

    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'plain',
        isActive: false,
        role: Role.General,
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.message).toBe('Username already exists');
      });
  });

  it('POST /api/users returns 400 when email exists', () => {
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue({ id: 6 });

    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'plain',
        isActive: false,
        role: Role.General,
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.message).toBe('Email already exists');
      });
  });

  it('DELETE /api/users/:id returns 204', () => {
    usersService.findOneById.mockResolvedValue({ id: 1 });
    usersService.remove.mockResolvedValue(undefined);

    return request(app.getHttpServer())
      .delete('/api/users/1')
      .expect(HttpStatus.NO_CONTENT);
  });

  it('DELETE /api/users/:id returns 404 when user not found', () => {
    usersService.findOneById.mockResolvedValue(null);

    return request(app.getHttpServer())
      .delete('/api/users/999')
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toBe('User not found');
      });
  });
});

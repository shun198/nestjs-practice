import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { UsersService } from '../users/users.service';
import { ScheduleEmailDto } from '../dto/schedule-email.dto';
import { RepeatableEmailDto } from '../dto/repeatable-email.dto';
import { Role } from '../entity/user.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let queue: {
    add: jest.Mock;
    upsertJobScheduler: jest.Mock;
    removeJobScheduler: jest.Mock;
    getJobSchedulers: jest.Mock;
  };
  let usersService: { findOneByEmail: jest.Mock };

  const existingUser = {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    password: 'hashed',
    isActive: true,
    role: Role.General,
  };

  beforeEach(async () => {
    queue = {
      add: jest.fn(),
      upsertJobScheduler: jest.fn(),
      removeJobScheduler: jest.fn(),
      getJobSchedulers: jest.fn(),
    };
    usersService = { findOneByEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: getQueueToken('schedule'), useValue: queue },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduleWelcomeEmail', () => {
    it('adds a delayed job when user exists and sendAt is in the future', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      const sendAt = new Date(now + 60_000).toISOString();
      const dto: ScheduleEmailDto = { email: 'john@example.com', sendAt };

      usersService.findOneByEmail.mockResolvedValue(existingUser);
      queue.add.mockResolvedValue({ id: '42' });

      const result = await service.scheduleWelcomeEmail(dto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(queue.add).toHaveBeenCalledWith(
        'send-welcome-email',
        { email: dto.email },
        { delay: 60_000 },
      );
      expect(result).toBe('Job scheduled: 42 (delay: 60s)');
    });

    it('throws NotFoundException when email is not registered', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      const dto: ScheduleEmailDto = {
        email: 'ghost@example.com',
        sendAt: new Date(Date.now() + 60_000).toISOString(),
      };

      await expect(service.scheduleWelcomeEmail(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('throws when sendAt is in the past', async () => {
      usersService.findOneByEmail.mockResolvedValue(existingUser);
      const dto: ScheduleEmailDto = {
        email: 'john@example.com',
        sendAt: new Date(Date.now() - 60_000).toISOString(),
      };

      await expect(service.scheduleWelcomeEmail(dto)).rejects.toThrow(
        'sendAt must be a future date',
      );
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('registerRepeatableWelcomeEmail', () => {
    it('upserts a repeatable job scheduler when user exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(existingUser);
      const dto: RepeatableEmailDto = {
        email: 'john@example.com',
        cronPattern: '0 0 * * *',
      };

      const result = await service.registerRepeatableWelcomeEmail(dto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
        `send-welcome-email:${dto.email}`,
        { pattern: dto.cronPattern },
        { name: 'send-welcome-email', data: { email: dto.email } },
      );
      expect(result).toBe(
        `Repeatable job registered: send-welcome-email:${dto.email} (pattern: ${dto.cronPattern})`,
      );
    });

    it('throws NotFoundException when email is not registered', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      const dto: RepeatableEmailDto = {
        email: 'ghost@example.com',
        cronPattern: '0 0 * * *',
      };

      await expect(service.registerRepeatableWelcomeEmail(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(queue.upsertJobScheduler).not.toHaveBeenCalled();
    });
  });

  describe('cancelRepeatableEmail', () => {
    it('removes a repeatable job scheduler by id', async () => {
      queue.removeJobScheduler.mockResolvedValue(undefined);

      await expect(
        service.cancelRepeatableEmail('scheduler-id'),
      ).resolves.toBeUndefined();
      expect(queue.removeJobScheduler).toHaveBeenCalledWith('scheduler-id');
    });
  });

  describe('getRepeatableJobs', () => {
    it('returns registered job schedulers', async () => {
      const schedulers = [{ id: 'scheduler-1' }];
      queue.getJobSchedulers.mockResolvedValue(schedulers);

      await expect(service.getRepeatableJobs()).resolves.toEqual(schedulers);
      expect(queue.getJobSchedulers).toHaveBeenCalledTimes(1);
    });
  });
});

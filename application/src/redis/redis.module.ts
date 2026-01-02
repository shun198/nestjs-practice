import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import redis from 'ioredis';

import { REDIS } from './redis.constants';

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async (configService: ConfigService) => {
        const client = new redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });
        client.set('key', 100, 'EX', configService.get<number>('REDIS_CACHE_EXPIRE'));
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
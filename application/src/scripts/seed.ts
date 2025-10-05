// https://docs.nestjs.com/standalone-applications
// https://dev.to/tkssharma/build-standalone-applications-with-nestjs-1pep
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../entity/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const userRepository = dataSource.getRepository(User);

    // サンプルユーザーデータ
    const users = [
      {
        username: 'john',
        password: 'changeme',
        isActive: true,
      },
      {
        username: 'maria',
        password: 'guess',
        isActive: true,
      },
      {
        username: 'chris',
        password: 'secret',
        isActive: false,
      },
    ];

    // ユーザーデータの挿入
    await userRepository.save(users);
    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

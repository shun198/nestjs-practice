// https://docs.nestjs.com/standalone-applications
// https://dev.to/tkssharma/build-standalone-applications-with-nestjs-1pep
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Role, User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const userRepository = dataSource.getRepository(User);
    const salt = await bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hash('test', salt);
    // サンプルユーザーデータ
    const users = [
      {
        username: 'john',
        password: hashedPassword,
        isActive: true,
        role: Role.Admin,
      },
      {
        username: 'maria',
        password: hashedPassword,
        isActive: true,
        role: Role.General,
      },
      {
        username: 'chris',
        password: hashedPassword,
        isActive: false,
        role: Role.General,
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


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../entity/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({where: { username: username },});
  }

  async findOneById(id: number): Promise<User> | null {
    return await this.usersRepository.findOne({ where: { id: id } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // https://docs.nestjs.com/security/encryption-and-hashing
    const salt = await bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
    return await this.usersRepository.findOneBy({ id: id })
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

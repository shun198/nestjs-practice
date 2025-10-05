import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private readonly dummyHash = bcrypt.hashSync('dummy', 10);

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    const isPasswordValid = await bcrypt.compare(
      pass,
      user?.password ?? this.dummyHash
    );
    if (!user || !isPasswordValid) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, userId: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}


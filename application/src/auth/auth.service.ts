import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private readonly dummyHash = bcrypt.hashSync('dummy', 10);

  async signIn(username: string, pass: string) {
    // ダミーのハッシュ値（実際のパスワードハッシュと同じ長さ）
    const user = await this.usersService.findOneByUsername(username);
    // ユーザーが存在しない場合でも、bcrypt.compareを実行
    // タイミング攻撃を防ぐため
    // Null合体演算子 (Nullish Coalescing Operator) を使用して、user?.passwordがnullまたはundefinedの場合にdummyHashを使用するようにしている
    const isPasswordValid = await bcrypt.compare(
      pass,
      user?.password ?? this.dummyHash
    );

    // 両方のチェックを同時に行う
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

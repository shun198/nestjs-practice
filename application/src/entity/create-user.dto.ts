import { IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  isActive: boolean = false;
}

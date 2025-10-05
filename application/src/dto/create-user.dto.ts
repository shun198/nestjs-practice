import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../entity/user.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  isActive: boolean = false;

  @IsEnum(Role, { message: 'role must be either admin or general' })
  @IsOptional()
  role?: Role = Role.General;
}

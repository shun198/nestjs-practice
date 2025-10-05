import { IsString, IsNumber } from 'class-validator';

export class ProfileDto {
  @IsString()
  username: string | null;

  @IsNumber()
  sub: number | null;

  @IsNumber()
  iat: number | null;

  @IsNumber()
  exp: number | null;
}
